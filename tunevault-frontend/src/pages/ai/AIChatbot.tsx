import { useState } from "react";
import { Send, Bot, User, Play } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date; // ← Thêm timestamp
}

interface Song {
  id: number;
  title: string;
  artist: string;
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là Music Assistant. Bạn muốn nghe nhạc gì hôm nay?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);

  const songDatabase: Song[] = [
    { id: 1, title: "Nơi Này Có Anh", artist: "Sơn Tùng M-TP" },
    { id: 8, title: "Lạ Lùng", artist: "Vũ." },
    { id: 3, title: "Mang Tiền Về Cho Mẹ", artist: "Đen" },
    { id: 18, title: "Không Thể Say", artist: "HIEUTHUHAI" },
    { id: 19, title: "Waiting For You", artist: "MONO" },
    { id: 2, title: "See Tình", artist: "Hoàng Thùy Linh" },
  ];

  // Hàm format thời gian
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBotResponse = (userMessage: string) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes("buồn") || msg.includes("sad")) {
      return {
        text: "Dưới đây là một số bài hát buồn hay:",
        songs: songDatabase.slice(0, 3),
      };
    }
    if (
      msg.includes("vui") ||
      msg.includes("happy") ||
      msg.includes("năng lượng")
    ) {
      return {
        text: "Tuyệt vời! Đây là vài bài hát vui và đầy năng lượng:",
        songs: songDatabase.slice(3, 6),
      };
    }
    if (
      msg.includes("tập trung") ||
      msg.includes("học bài") ||
      msg.includes("làm việc")
    ) {
      return {
        text: "Đây là những bài hát phù hợp để tập trung:",
        songs: [songDatabase[0], songDatabase[2], songDatabase[4]],
      };
    }
    if (msg.includes("sơn tùng") || msg.includes("sontung")) {
      return {
        text: "Đây là một số bài hát của Sơn Tùng M-TP:",
        songs: songDatabase.filter((s) => s.artist.includes("Sơn Tùng")),
      };
    }
    return {
      text: "Tôi hiểu rồi! Đây là một số bài hát bạn có thể thích:",
      songs: [...songDatabase].sort(() => 0.5 - Math.random()).slice(0, 4),
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(input);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.text,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response.songs && response.songs.length > 0) {
        response.songs.forEach((song, index) => {
          setTimeout(
            () => {
              const songMessage: Message = {
                id: Date.now() + index + 10,
                text: `🎵 ${song.title} - ${song.artist}`,
                isBot: true,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, songMessage]);
            },
            600 * (index + 1),
          );
        });
      }

      setIsTyping(false);
    }, 800);
  };

  const handlePlaySong = (songTitle: string) => {
    const foundSong = songDatabase.find((s) => songTitle.includes(s.title));
    if (foundSong) {
      const track = {
        id: foundSong.id,
        title: foundSong.title,
        artist: foundSong.artist,
        duration: 0,
        audioUrl: mediaService.getStreamUrl(foundSong.id),
      };
      playTrack(track);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <Bot size={28} className="text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Music Assistant</h1>
          <p className="text-gray-400">AI hỗ trợ tìm nhạc cho bạn</p>
        </div>
      </div>

      <div className="bg-[#181818] rounded-2xl h-[520px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.isBot ? "bg-[#282828] text-white" : "bg-green-600 text-white"}`}
              >
                <div className="flex items-start gap-2">
                  {msg.isBot && (
                    <Bot size={18} className="mt-1 flex-shrink-0" />
                  )}
                  {!msg.isBot && (
                    <User size={18} className="mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p>{msg.text}</p>
                    {/* Hiển thị thời gian */}
                    <p className="text-[10px] mt-1 opacity-60 text-right">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>

                {msg.text.includes("🎵") && (
                  <button
                    onClick={() => handlePlaySong(msg.text)}
                    className="mt-2 flex items-center gap-2 text-sm bg-[#3a3a3a] hover:bg-[#4a4a4a] px-3 py-1 rounded-full"
                  >
                    <Play size={14} /> Phát ngay
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#282828] px-4 py-3 rounded-2xl flex items-center gap-2">
                <Bot size={18} />
                <span className="text-gray-400">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#282828]">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hãy nói gì đó... (ví dụ: nhạc buồn, nhạc để học bài)"
              className="flex-1 bg-[#282828] px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleSend}
              className="bg-green-500 hover:bg-green-400 text-black p-3 rounded-full transition"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Thử hỏi: "nhạc buồn", "nhạc để tập trung", "bài hát của Sơn Tùng"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
