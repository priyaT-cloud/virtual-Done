import type { ImageDetails } from './types';

/**
 * Converts a file to a base64 string, its MIME type, and a data URL.
 */
export function fileToImageDetails(file: File): Promise<ImageDetails> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mimeType = file.type;
      const base64 = dataUrl.split(',')[1];
      if (!base64) {
        return reject(new Error('Failed to read base64 data from file.'));
      }
      resolve({ base64, mimeType, dataUrl });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a data URL string to an ImageDetails object.
 */
export function dataUrlToImageDetails(dataUrl: string): ImageDetails {
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const base64 = dataUrl.split(',')[1];
    return { dataUrl, mimeType, base64 };
}
