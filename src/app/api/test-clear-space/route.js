import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getClearSpacePrompt } from '../../../lib/clearSpaceRules';
import fs from 'fs';
import path from 'path';

export const maxDuration = 60;

export async function POST(req) {
  console.log('[API test-clear-space] POST initiated');
  
  try {
    const { base64File, mimeType } = await req.json();
    
    if (!base64File || !mimeType) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    const systemPrompt = getClearSpacePrompt();

    console.log('\n--- SYSTEM INSTRUCTION ---\n', systemPrompt);

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.0,
        responseMimeType: "application/json",
      }
    });

    let base64Data = base64File;
    const match = base64File.match(/^data:(.+?);base64,(.+)$/);
    if (match) {
      base64Data = match[2];
    }

    const userImagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const parts = [];
    
    // Load specifically clear_space.png
    try {
      const refPath = path.join(process.cwd(), 'public', 'brand-references', 'clear_space.png');
      if (fs.existsSync(refPath)) {
        const fileData = fs.readFileSync(refPath).toString('base64');
        parts.push({
          inlineData: { data: fileData, mimeType: 'image/png' }
        });
        parts.push("The image above is a REFERENCE image from the Brand Manual showing the correct clear space rule (distance X). Use it as ground truth.");
      }
    } catch (e) {
      console.warn('[API route] Could not load clear_space.png:', e);
    }

    parts.push("Now, please analyze the user-uploaded flyer below for clear space compliance:");
    parts.push(userImagePart);

    console.log('\n--- USER PROMPT PARTS LENGTH ---\n', parts.length);

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log('\n--- RAW GEMINI RESPONSE ---\n', text);
    
    let parsedJson;
    try {
      let cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanedText);
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
