// ============================================================
// AI / TUNEBOT TYPES
// ============================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface RecommendationResponse {
  items: { title: string; artist: string; mediaItemId?: string }[];
}

export interface AutoTagResponse {
  tags: string[];
}
