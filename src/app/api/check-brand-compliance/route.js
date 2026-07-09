import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBrandCompliancePrompt } from '../../../lib/brandRules';

export const maxDuration = 60;

export async function POST(req) {
  console.log('[API route] POST /api/check-brand-compliance initiated');
  
  try {
    const { base64File, mimeType } = await req.json();
    
    if (!base64File || !mimeType) {
      console.error('[API route] No file or mimeType provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[API route] GEMINI_API_KEY is not configured');
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        temperature: 0.0,
        responseMimeType: "application/json",
      }
    });

    // Remove the data URL prefix if it exists
    let base64Data = base64File;
    const match = base64File.match(/^data:(.+?);base64,(.+)$/);
    if (match) {
      base64Data = match[2];
    }

    const prompt = getBrandCompliancePrompt();

    // 1. Prepare the user's uploaded image
    const userImagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    // 2. Load Reference Images (if they exist)
    const fs = require('fs');
    const path = require('path');
    const parts = [prompt];

    try {
      const refDir = path.join(process.cwd(), 'public', 'brand-references');
      if (fs.existsSync(refDir)) {
        const files = fs.readdirSync(refDir);
        for (const file of files) {
          if (file.match(/\.(png|jpe?g)$/i)) {
            const filePath = path.join(refDir, file);
            const fileData = fs.readFileSync(filePath).toString('base64');
            const fileMime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
            parts.push({
              inlineData: { data: fileData, mimeType: fileMime }
            });
          }
        }
        if (files.length > 0) {
           parts.push("The images above are REFERENCE images from the Brand Manual showing correct guidelines and examples of what NOT to do. Use them as ground truth.");
        }
      }
    } catch (e) {
      console.warn('[API route] Could not load reference images:', e);
    }

    // 3. Append the user's image at the very end
    parts.push("Now, please analyze the following user-uploaded flyer:");
    parts.push(userImagePart);

    console.log('[API route] Sending request to Gemini with reference images...');
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log('[API route] Response received from Gemini');
    
    let parsedJson;
    try {
      // Clean the response: remove markdown formatting if Gemini wrapped it
      let cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanedText);
      // Inject the count of reference images used so the frontend knows
      // Count any part that is inlineData EXCEPT the last one (which is the user image)
      const imageParts = parts.filter(p => p.inlineData);
      const refImagesCount = Math.max(0, imageParts.length - 1);
      parsedJson.referenceImagesUsed = refImagesCount;
    } catch (e) {
      console.error('[API route] Failed to parse Gemini response as JSON', text);
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 });
    }

    return NextResponse.json(parsedJson);

  } catch (error) {
    console.error('[API route] Error during processing:', error);
    
    if (error.message && error.message.includes('429')) {
      return NextResponse.json({ 
        error: 'You have exceeded your Gemini API free tier quota (429 Too Many Requests). Please wait and try again, or switch to a different model in your .env file.' 
      }, { status: 429 });
    }

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
