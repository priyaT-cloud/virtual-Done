import { GoogleGenAI, Modality, type GenerateContentResponse } from "@google/genai";
import type { ImageDetails } from '../types';
import { dataUrlToImageDetails } from "../utils/fileUtils";

// FIX: Correctly initialize GoogleGenAI and remove the deprecated `getModel` call.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Performs the virtual try-on operation.
 * @param personImage The image of the person.
 * @param clothingImage The image of the garment.
 * @returns A promise that resolves to the generated image and any accompanying text.
 */
export async function virtualTryOn(
  personImage: ImageDetails,
  clothingImage: ImageDetails
): Promise<{ image: ImageDetails | null; text: string | null; }> {
  const prompt = `
    **ROLE: Expert CGI Digital Tailor**
    **TASK: Perform a complete and total virtual clothing replacement, even for drastically different garment types (e.g., replacing a draped saree with a structured shirt and pants).**

    **CRITICAL INSTRUCTION: You must COMPLETELY OBLITERATE and REPLACE the original clothing. Do NOT simply edit or overlay. You must reconstruct the person's body shape underneath the original garment to correctly fit the new one.**

    **WORKFLOW:**
    1.  **Analyze Person:** Identify the person's full body, pose, and proportions from the first image.
    2.  **Analyze Garment:** Identify the new clothing item from the second image. Note its type, shape, and fabric.
    3.  **Reconstruct & Replace:** This is the most important step. Virtually reconstruct the person's body form that is obscured by their original clothing. Then, meticulously fit and drape the NEW garment onto this reconstructed form. This is essential for transformations like from a dress/saree to pants.
    4.  **Integrate Realistically:** Render the new garment with photorealistic lighting, shadows, wrinkles, and fabric texture that perfectly match the original photo's environment. Create realistic contact shadows where the new clothing touches the body.
    5.  **Preserve Identity:** The person's face, hair, skin tone, body position, and the background must remain completely unchanged.
    
    **GOAL: Generate a seamless, photorealistic image where the person is naturally wearing the new clothing as if it were part of the original photograph.**
  `;

  const personImagePart = {
    inlineData: { data: personImage.base64, mimeType: personImage.mimeType },
  };
  const clothingImagePart = {
    inlineData: { data: clothingImage.base64, mimeType: clothingImage.mimeType },
  };

  // FIX: Call `ai.models.generateContent` and pass the model name directly, instead of using a pre-fetched model object.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: {
      parts: [personImagePart, clothingImagePart, { text: prompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  return processResponse(response);
}

/**
 * Edits an existing image based on a text prompt.
 * @param baseImage The image to be edited.
 * @param prompt The text instruction for the edit.
 * @returns A promise that resolves to the edited image and any accompanying text.
 */
export async function editImage(
  baseImage: ImageDetails,
  prompt: string
): Promise<{ image: ImageDetails | null; text: string | null; }> {
  
  const baseImagePart = {
    inlineData: { data: baseImage.base64, mimeType: baseImage.mimeType },
  };
  const textPart = { text: prompt };

  // FIX: Call `ai.models.generateContent` and pass the model name directly, instead of using a pre-fetched model object.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: {
      parts: [baseImagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  return processResponse(response);
}


/**
 * Processes the response from the Gemini API.
 */
function processResponse(response: GenerateContentResponse): { image: ImageDetails | null; text: string | null; } {
  let image: ImageDetails | null = null;
  let text: string | null = null;

  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        image = dataUrlToImageDetails(dataUrl);
      } else if (part.text) {
        text = part.text;
      }
    }
  }

  if (!image && !text) {
    throw new Error("The AI did not return a valid image or text response. Please try again.");
  }

  return { image, text };
}

/**
 * Generates fashion advice for a given image.
 * @param resultImage The image of the person wearing the new outfit.
 * @param promptContext A string describing how the outfit was generated.
 * @returns A promise that resolves to the generated fashion advice text.
 */
export async function getFashionAdvice(
  resultImage: ImageDetails,
  promptContext: string
): Promise<string> {
  const systemInstruction = `You are "StyleBot," a friendly, encouraging, and world-class AI fashion stylist. Your knowledge spans from haute couture to street style, and you are an expert on current trends and timeless classics.
Your task is to analyze the user's new outfit and provide constructive, positive, and inspiring feedback.

Your response MUST be structured in three parts with bolded titles:
1.  **Compliment:** Start with a genuine and specific compliment about the outfit.
2.  **Suggestion:** Offer a friendly suggestion. This could be about an accessory (like a bag, shoes, or jewelry), a hairstyle, or a different way to style the piece for another occasion. Frame it as an idea to "elevate the look" or "try next time."
3.  **Fashion Guide:** Provide a short, interesting insight or tip related to the style of the outfit. This could be about the color, the fabric, the history of the garment type, or how it fits into a current trend.

Keep your tone upbeat, personal, and helpful. Do not be generic.`;

  const resultImagePart = {
    inlineData: { data: resultImage.base64, mimeType: resultImage.mimeType },
  };

  const textPrompt = `Here is my new look, which was created based on this context: "${promptContext}". Please be my "StyleBot" and give me some fashion advice based on the image!`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [resultImagePart, { text: textPrompt }],
    },
    config: {
      systemInstruction: systemInstruction,
    },
  });

  const advice = response.text;
  if (!advice) {
    throw new Error("StyleBot is thinking... but couldn't come up with advice right now. Please try again.");
  }

  return advice;
}
