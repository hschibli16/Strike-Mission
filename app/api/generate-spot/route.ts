import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { spotName, type } = await request.json();

  if (!spotName || !type) {
    return NextResponse.json({ error: 'spotName and type required' }, { status: 400 });
  }

  const prompt = `Generate a complete surf or ski spot profile for "${spotName}" (type: ${type}).

Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just the raw JSON.

The JSON must match this exact structure:
{
  "slug": "url-friendly-slug",
  "name": "Full Name",
  "location": "City/Region, Country",
  "country": "Country Name",
  "type": "${type}",
  "lat": 0.0000,
  "lon": 0.0000,
  "airportCode": "XXX",
  "tagline": "One punchy line about this spot",
  "description": "2-3 sentences about what makes this place special for surfers/skiers",
  "bestMonths": [1,2,3],
  "flightFrom": "NYC",
  "flightPrice": 000,
  "hotelPrice": 00,
  "bestBreak": "Description of the best wave/run and how to surf/ski it",
  "idealConditions": "Ideal swell/snow conditions for this spot",
  "idealSwellDirection": 000,
  "idealWindDirection": 000,
  "weekendTrip": {
    "title": "Weekend Trip Title",
    "days": [
      { "day": "Friday", "plan": "Detailed plan for the day" },
      { "day": "Saturday", "plan": "Detailed plan for the day" },
      { "day": "Sunday", "plan": "Detailed plan for the day" }
    ]
  },
  "weekTrip": {
    "title": "Week Trip Title",
    "days": [
      { "day": "Day 1", "plan": "Detailed plan" },
      { "day": "Day 2", "plan": "Detailed plan" },
      { "day": "Day 3", "plan": "Detailed plan" },
      { "day": "Day 4", "plan": "Detailed plan" },
      { "day": "Day 5", "plan": "Detailed plan" },
      { "day": "Day 6", "plan": "Detailed plan" },
      { "day": "Day 7", "plan": "Detailed plan" }
    ]
  },
  "localTips": [
    "Tip 1",
    "Tip 2", 
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ]
}

Be accurate with coordinates, airport codes, flight prices from NYC, and local hotel prices.
For surf spots include idealSwellDirection and idealWindDirection in degrees.
For ski spots you can omit idealSwellDirection and idealWindDirection.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const spot = JSON.parse(clean);

    return NextResponse.json({ spot });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
