import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Allow up to 60s for Vercel if deployed

export async function POST(req) {
  console.log('[API route] POST /api/extract-agenda initiated');
  
  try {
    const { base64Image } = await req.json();
    console.log('[API route] Request JSON parsed. Base64 string length:', base64Image ? base64Image.length : 0);

    if (!base64Image) {
      console.error('[API route] No image provided in request');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[API route] GEMINI_API_KEY is not configured on the server.');
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    // Mask API key for logging safety (show only first 6 and last 4 characters)
    const maskedKey = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`[API route] Using API Key: ${maskedKey}`);

    console.log('[API route] Initializing GoogleGenerativeAI client...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const selectedModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    console.log(`[API route] Using Model: ${selectedModel}`);

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    console.log('[API route] Parsing base64 image data...');
    const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      console.error('[API route] Invalid base64 image format. String starts with:', base64Image.substring(0, 30));
      return NextResponse.json({ error: 'Invalid base64 image format' }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    console.log(`[API route] Image parsed successfully. Mime type: ${mimeType}, Data length: ${base64Data.length}`);

    const prompt = `
      You are an expert OCR and data extraction assistant for Toastmasters International clubs.
      I have provided an image of a Toastmasters meeting agenda. 
      Read the agenda carefully and extract the information into the exact JSON structure below.
      If a piece of information is missing, use an empty string or empty array.
      Do not hallucinate names.
      
      Output Schema:
      {
        "meetingInfo": {
          "clubName": "string",
          "date": "string (YYYY-MM-DD)",
          "number": "string (Meeting number)",
          "theme": "string",
          "wordOfTheDay": "string"
        },
        "attendees": ["string array of names found"],
        "officers": {
          "president": "string",
          "vpe": "string",
          "vpm": "string",
          "vppr": "string",
          "secretary": "string",
          "treasurer": "string",
          "saa": "string",
          "ipp": "string"
        },
        "roles": {
          "tmod": "string (Toastmaster of the Day)",
          "generalEvaluator": "string",
          "tableTopicsMaster": "string",
          "timer": "string",
          "ahCounter": "string",
          "grammarian": "string",
          "presidingOfficer": "string",
          "saa": "string (Sergeant at Arms)"
        },
        "speeches": [
          {
            "speaker": "string",
            "title": "string",
            "project": "string",
            "duration": "string",
            "evaluator": "string"
          }
        ],
        "evaluators": [],
        "tableTopics": [],
        "generalEvaluation": {
          "commendations": "",
          "recommendations": ""
        },
        "awards": {
          "bestSpeaker": "",
          "bestTableTopics": "",
          "bestEvaluator": "",
          "bestRolePlayer": ""
        },
        "notes": ""
      }
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    console.log('[API route] Sending request to Gemini API (gemini-1.5-flash)...');
    const result = await model.generateContent([prompt, ...imageParts]);
    console.log('[API route] Response received from Gemini API');
    
    const response = await result.response;
    const text = response.text();
    console.log('[API route] Raw response text length:', text.length);
    
    const parsedData = JSON.parse(text);
    console.log('[API route] JSON parsing successful. Returning 200 OK');

    return NextResponse.json(parsedData, { status: 200 });

  } catch (error) {
    console.error('==================================================');
    console.error('[API route] FATAL ERROR IN /api/extract-agenda');
    console.error('[API route] Error Name:', error.name);
    console.error('[API route] Error Message:', error.message);
    if (error.status) console.error('[API route] Error Status:', error.status);
    if (error.stack) console.error('[API route] Error Stack:', error.stack);
    // Log complete error object for debugging deep nested issues (like GoogleGenerativeAI Error)
    console.error('[API route] Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('==================================================');

    return NextResponse.json(
      { 
        error: 'Failed to process agenda', 
        details: error.message,
        name: error.name
      },
      { status: 500 }
    );
  }
}
