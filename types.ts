export interface ImageDetails {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

export interface TryOnResult {
  image: string | null;
  text: string | null;
}

// Fix: Add the missing Outfit interface.
export interface Outfit {
  url: string;
  description: string;
  category: 'Top' | 'Bottom';
}
