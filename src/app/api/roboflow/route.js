import { NextResponse } from 'next/server';

export const maxDuration = 60; // Just in case it takes longer on hobby plans

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch('https://serverless.roboflow.com/ananthas-workspace-itabv/workflows/tm-logo-vtm-logo-1-yolo11n-t1-logic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    if (!response.ok) {
      return NextResponse.json({ error: data, status: response.status }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Roboflow proxy error:", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch from Roboflow' }, { status: 500 });
  }
}
