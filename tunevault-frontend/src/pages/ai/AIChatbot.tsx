import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Bot, User, Play, Trash2 } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { useAuthStore } from "../../stores/authStore";
import { mediaService } from "../../api";
import { aiService } from "../../api/aiService";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  songs?: Song[];
  isStreaming?: boolean;
}

interface Song {
  id: number;
  title: string;
  artist: string;
}

const TUNEVAULT_SONGS: Song[] = [
  { id: 1, title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP" },
  { id: 8, title: "Lạ Lùng", artist: "Vũ." },
  { id: 3, title: "Mang Tiền Về Cho Mẹ", artist: "Đen" },
  { id: 18, title: "Không Thể Say", artist: "HIEUTHUHAI" },
  { id: 19, title: "Waiting For You", artist: "MONO" },
  { id: 2, title: "See Tình", artist: "Hoàng Thùy Linh" },
  { id: 7, title: "Come My Way", artist: "Sơn Tùng M-TP" },
  { id: 4, title: "Có Hẹn Với Thanh Xuân", artist: "MONSTAR" },
  { id: 5, title: "Sau Tất Cả", artist: "ERIK" },
  { id: 6, title: "Có Chàng Trai Viết Lên Cây", artist: "Phan Mạnh Quỳnh" },
  { id: 20, title: "Thiệp Hồng Sai Tên", artist: "Nguyễn Thành Đạt" },
  {
    id: 21,
    title: "MASHUP ROCK THIỆP HỒNG",
    artist: "TÓC TIÊN, MAIQUINN, MUỘI, YEOLAN, ĐÀO TỬ A1J x DTAP",
  },
];

const createInitialMessage = (): Message => ({
  id: 1,
  text: "Xin chào! Tôi là Music Assistant. Bạn muốn nghe nhạc gì hôm nay?",
  isBot: true,
  timestamp: new Date(),
});

const getUserStorageKey = (user: unknown) => {
  const currentUser = user as
    | {
        id?: string;
        userId?: string;
        email?: string;
        displayName?: string;
      }
    | null
    | undefined;

  const key =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.email ||
    currentUser?.displayName ||
    "default";

  return `tunevault-ai-chat-history:${key}`;
};

const GLOBAL_STORAGE_KEY = "tunevault-ai-chat-history:last";

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([createInitialMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const chatStorageKey = useMemo(() => getUserStorageKey(user), [user]);

  useEffect(() => {
    const savedByUser = localStorage.getItem(chatStorageKey);
    const savedGlobal = localStorage.getItem(GLOBAL_STORAGE_KEY);
    const saved = savedByUser || savedGlobal;

    if (!saved) {
      setMessages([createInitialMessage()]);
      setHistoryLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved).map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
        isStreaming: false,
      }));

      setMessages(parsed.length > 0 ? parsed : [createInitialMessage()]);
    } catch {
      localStorage.removeItem(chatStorageKey);
      localStorage.removeItem(GLOBAL_STORAGE_KEY);
      setMessages([createInitialMessage()]);
    } finally {
      setHistoryLoaded(true);
    }
  }, [chatStorageKey]);

  useEffect(() => {
    if (!historyLoaded) return;

    const safeMessages = messages
      .filter((m) => m.text.trim() || !m.isBot)
      .map((m) => ({
        ...m,
        isStreaming: false,
      }));

    const value = JSON.stringify(
      safeMessages.length > 0 ? safeMessages : [createInitialMessage()],
    );

    localStorage.setItem(chatStorageKey, value);
    localStorage.setItem(GLOBAL_STORAGE_KEY, value);
  }, [chatStorageKey, historyLoaded, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const buildMediaAwarePrompt = (userMessage: string) => {
    const availableSongs = TUNEVAULT_SONGS.map(
      (song) => `- ${song.title} - ${song.artist}`,
    ).join("\n");

    return `
DỮ LIỆU KHO MEDIA HIỆN CÓ TRÊN TUNEVAULT:
${availableSongs}

QUY TẮC BẮT BUỘC:
- Nếu người dùng hỏi/gợi ý thể loại hoặc bài hát có trong danh sách trên, hãy ưu tiên gợi ý các bài hát đang có trên TuneVault.
- Nếu người dùng hỏi bài hát/thể loại mà TuneVault hiện chưa có, phải nói rõ: "Hiện tại TuneVault chưa có các bài hát đó."
- Sau đó có thể đề xuất một vài bài hát ngoài web thật để người dùng tham khảo, nhưng phải nói rõ đó là bài tham khảo bên ngoài TuneVault.
- Không được nói rằng TuneVault có bài hát nếu bài đó không nằm trong danh sách kho media ở trên.
- Trả lời ngắn gọn, tối đa 10 dòng.
- Không dùng gạch đầu dòng, có thể đánh số thứ tự.
- Nếu gợi ý bài hát thì ghi dạng: **Tên bài** - Nghệ sĩ.

YÊU CẦU NGƯỜI DÙNG:
${userMessage}
`.trim();
  };

  const extractSongsFromText = (text: string): Song[] => {
    const lowerText = text.toLowerCase();

    return TUNEVAULT_SONGS.filter((song) =>
      lowerText.includes(song.title.toLowerCase()),
    );
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatMessageText = (text: string) => {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-gray-200">$1</em>')
      .replace(/\n/g, "<br />");
  };

  const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5090";
    return envUrl.replace(/\/$/, "");
  };

  const updateBotMessage = (
    botMessageId: number,
    updater: (message: Message) => Message,
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === botMessageId ? updater(m) : m)),
    );
  };

  const handleSsePayload = (
    payload: string,
    botMessageId: number,
    fullTextRef: { current: string },
  ) => {
    if (!payload || payload === "[DONE]") return;

    let chunk = payload;

    try {
      chunk = JSON.parse(payload);
    } catch {
      // Cho phép backend gửi plain text.
    }

    if (!chunk) return;

    fullTextRef.current += chunk;

    updateBotMessage(botMessageId, (m) => ({
      ...m,
      text: fullTextRef.current,
      songs: extractSongsFromText(fullTextRef.current),
    }));
  };

  const sendStreamingMessage = async (
    userMessageText: string,
    botMessageId: number,
  ) => {
    const response = await fetch(`${getApiBaseUrl()}/api/ai/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message: buildMediaAwarePrompt(userMessageText),
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream endpoint failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    const fullTextRef = { current: "" };

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const lines = event.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const payload = line.replace(/^data:\s?/, "").trim();

          if (payload === "[DONE]") return;

          handleSsePayload(payload, botMessageId, fullTextRef);
        }
      }
    }
  };

  const sendNormalMessageFallback = async (
    userMessageText: string,
    botMessageId: number,
  ) => {
    const reply = await aiService.chat(buildMediaAwarePrompt(userMessageText));

    const botText =
      reply?.trim() ||
      "Mình chưa nhận được phản hồi từ AI. Bạn thử lại sau nhé.";

    updateBotMessage(botMessageId, (m) => ({
      ...m,
      text: botText,
      songs: extractSongsFromText(botText),
      isStreaming: false,
    }));
  };

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    const botMessageId = Date.now() + 1;

    const botMessage: Message = {
      id: botMessageId,
      text: "",
      isBot: true,
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
    setIsTyping(true);

    try {
      try {
        await sendStreamingMessage(messageText, botMessageId);
      } catch (streamError) {
        console.warn("SSE lỗi, chuyển sang chat thường:", streamError);
        await sendNormalMessageFallback(messageText, botMessageId);
      }

      updateBotMessage(botMessageId, (m) => ({
        ...m,
        isStreaming: false,
        songs: extractSongsFromText(m.text),
      }));
    } catch (error) {
      console.error("AI chat error:", error);

      updateBotMessage(botMessageId, (m) => ({
        ...m,
        text:
          m.text ||
          "Hiện tại Music Assistant chưa kết nối được với AI. Bạn thử lại sau nhé.",
        isStreaming: false,
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    playTrack({
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: 0,
      audioUrl: mediaService.getStreamUrl(song.id),
    });
  };

  const clearChat = () => {
    const initial = createInitialMessage();
    const value = JSON.stringify([initial]);

    setMessages([initial]);
    localStorage.setItem(chatStorageKey, value);
    localStorage.setItem(GLOBAL_STORAGE_KEY, value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
            <Bot size={28} className="text-black" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Music Assistant</h1>
            <p className="text-sm text-gray-400">AI gợi ý nhạc TuneVault</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-full bg-[#282828] px-4 py-2 text-sm text-gray-400 transition hover:bg-[#3a3a3a] hover:text-white"
        >
          <Trash2 size={16} /> Xóa lịch sử
        </button>
      </div>

      <div className="flex h-[580px] flex-col overflow-hidden rounded-3xl border border-[#282828] bg-[#181818]">
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
            >
              <div className="max-w-[82%]">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.isBot
                      ? "bg-[#282828] text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {msg.isBot ? (
                      <Bot
                        size={20}
                        className="mt-0.5 flex-shrink-0 text-green-400"
                      />
                    ) : (
                      <User size={20} className="mt-0.5 flex-shrink-0" />
                    )}

                    {msg.text ? (
                      <div
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatMessageText(msg.text),
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-1 py-1">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 delay-150" />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 delay-300" />
                      </div>
                    )}
                  </div>

                  {msg.songs && msg.songs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.songs.map((song) => (
                        <button
                          key={`${msg.id}-${song.id}`}
                          onClick={() => handlePlaySong(song)}
                          className="group flex w-full items-center justify-between rounded-xl bg-[#1f1f1f] px-4 py-2.5 text-left transition hover:bg-[#2a2a2a]"
                        >
                          <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-sm text-gray-400">
                              {song.artist}
                            </p>
                          </div>

                          <Play
                            size={18}
                            className="text-green-400 opacity-0 transition group-hover:opacity-100"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="mt-1 px-1 text-right text-[10px] text-gray-500">
                  {msg.isStreaming
                    ? "Đang trả lời..."
                    : formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[#282828] p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hãy nói gì đó với Music Assistant..."
              className="flex-1 rounded-2xl bg-[#282828] px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-2xl bg-green-500 p-3.5 text-black transition hover:bg-green-400 disabled:bg-gray-600"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
