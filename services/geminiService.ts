import { GoogleGenAI, Modality } from "@google/genai";
import { ImageDetails, TryOnResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const virtualTryOn = async (
  personImage: ImageDetails,
  clothingImage: ImageDetails
): Promise<TryOnResult> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const personImagePart = {
      inlineData: {
        mimeType: personImage.mimeType,
        data: personImage.base64,
      },
    };

    const clothingImagePart = {
      inlineData: {
        mimeType: clothingImage.mimeType,
        data: clothingImage.base64,
      },
    };

    const textPart = {
      text: `
      You are an expert AI in photorealistic apparel visualization. Your task is to perform a virtual try-on.
      You will be given two images:
      1. A garment image: This first image contains the clothing item to be put on the person.
      2. A person's image: This second image shows the person who will wear the clothing.

      Follow these instructions precisely:
      1.  **Isolate the Garment:** In the first image (the garment image), your first step is to identify and mentally isolate the primary clothing item. It might be on a hanger, on a bed, or in a non-ideal setting. You must ignore any background, hangers, or other distracting elements. Your focus is solely on the garment itself.
      2.  **Analyze the Garment:** Once isolated, understand the clothing item's type (e.g., jacket, shirt, skirt), shape, texture, and how it would drape on a body.
      3.  **Analyze the Person:** In the second image, analyze the person's body shape, their pose and posture, and the lighting conditions of their environment (e.g., where shadows fall).
      4.  **Perform Photorealistic Replacement:** Your main goal is to **REPLACE** the clothes the person is currently wearing with the isolated garment. This is not an overlay. The final image must look like the person is naturally wearing the new item.
      5.  **Maintain Realism:**
          -   The new garment must conform realistically to the person's body contours and pose.
          -   The lighting, shadows, and perspective on the garment must perfectly match the original person's photo to look natural.
      6.  **Preserve Everything Else:** You MUST NOT alter the person's body, face, hair, or skin tone. The background of the person's photo must remain completely unchanged. The only change is swapping the clothes.
      7.  **Final Output:** Generate a single, high-resolution, photorealistic image showing the final result. Do not include any text, logos, or other artifacts in your output image.
      `,
    };

    // The order is important: garment, then person, then instructions.
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [clothingImagePart, personImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response candidates from the API.");
    }

    const result: TryOnResult = { image: null, text: null };
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        const base64ImageBytes = part.inlineData.data;
        result.image = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      } else if (part.text) {
        result.text = (result.text || '') + part.text;
      }
    }

    if (!result.image) {
      throw new Error("API did not return a valid image. It may have been blocked or the prompt was unclear.");
    }
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    throw new Error("Failed to generate virtual try-on image.");
  }
};