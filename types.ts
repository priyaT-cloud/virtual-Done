export interface ImageDetails {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
