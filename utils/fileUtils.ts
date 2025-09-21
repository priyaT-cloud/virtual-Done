import { ImageDetails } from '../types';

/**
 * Converts an image file from an input element to a base64 string and other details.
 */
export const fileToImageDetails = (file: File): Promise<ImageDetails> => {
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
};
