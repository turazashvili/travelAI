import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { TravelEvent } from '../models/travel-event.model';
import { Trip } from '../models/trip.model';

export interface DestinationSuggestions {
  restaurants: Array<{
    name: string;
    cuisine: string;
    description: string;
    priceRange: string;
    location: string;
  }>;
  sightseeing: Array<{
    name: string;
    type: string;
    description: string;
    estimatedTime: string;
    location: string;
  }>;
  activities: Array<{
    name: string;
    type: string;
    description: string;
    duration: string;
    location: string;
  }>;
  localTips: string[];
  transportation: Array<{
    type: string;
    description: string;
    cost: string;
  }>;
  weather: {
    description: string;
    suggestion: string;
  };
}

@Injectable()
export class DestinationAIService {
  private openai: OpenAI;

  constructor() {
    if (process.env.OPENAI_API_TOKEN) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_TOKEN,
      });
    }
  }

  async generateDestinationSuggestions(
    trip: Trip, 
    events: TravelEvent[]
  ): Promise<DestinationSuggestions | null> {
    if (!this.openai || !trip.destination) {
      return null;
    }

    try {
      const prompt = this.buildDestinationPrompt(trip, events);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable travel expert and local guide. Provide personalized, practical travel recommendations in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(response) as DestinationSuggestions;
      
    } catch (error) {
      console.error('AI destination suggestions failed:', error);
      return null;
    }
  }

  async generateTravelInsights(
    trip: Trip,
    events: TravelEvent[]
  ): Promise<string> {
    if (!this.openai) {
      return this.generateBasicInsights(trip, events);
    }

    try {
      const prompt = `
Analyze this travel itinerary and provide helpful insights and tips:

DESTINATION: ${trip.destination}
DURATION: ${trip.startDate ? `${trip.startDate.toDateString()} to ${trip.endDate?.toDateString()}` : 'Multiple days'}

BOOKINGS:
${events.map(e => `- ${e.type}: ${e.title} ${e.startDateTime ? `on ${e.startDateTime.toDateString()}` : ''}`).join('\n')}

Provide 2-3 helpful, personalized insights or tips for this specific trip. Keep it concise and practical.
Return only the text, no JSON structure.
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel advisor. Provide concise, practical travel insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || this.generateBasicInsights(trip, events);
      
    } catch (error) {
      console.error('AI travel insights failed:', error);
      return this.generateBasicInsights(trip, events);
    }
  }

  private buildDestinationPrompt(trip: Trip, events: TravelEvent[]): string {
    const duration = trip.startDate && trip.endDate 
      ? Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24))
      : events.length;

    const currentMonth = trip.startDate ? trip.startDate.getMonth() + 1 : new Date().getMonth() + 1;
    
    return `
Generate travel recommendations for a trip to ${trip.destination}.

TRIP DETAILS:
- Destination: ${trip.destination}
- Duration: ${duration} days
- Month: ${currentMonth}
- Existing bookings: ${events.map(e => `${e.type} (${e.title})`).join(', ')}

Return a JSON object with this exact structure:

{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Type of cuisine",
      "description": "Brief description and why it's recommended",
      "priceRange": "$$ | $$$ | $$$$",
      "location": "Area/district in the city"
    }
  ],
  "sightseeing": [
    {
      "name": "Attraction Name",
      "type": "Museum/Park/Historic Site/etc",
      "description": "What makes this special and worth visiting",
      "estimatedTime": "2-3 hours",
      "location": "Area/district"
    }
  ],
  "activities": [
    {
      "name": "Activity Name",
      "type": "Tour/Adventure/Cultural/etc",
      "description": "What the activity involves",
      "duration": "Half day/Full day/2 hours",
      "location": "Where it takes place"
    }
  ],
  "localTips": [
    "Practical tip 1",
    "Cultural insight 2",
    "Money-saving tip 3"
  ],
  "transportation": [
    {
      "type": "Metro/Taxi/Bus/Walking",
      "description": "How to get around efficiently",
      "cost": "Approximate cost range"
    }
  ],
  "weather": {
    "description": "Expected weather for month ${currentMonth}",
    "suggestion": "What to pack or expect"
  }
}

REQUIREMENTS:
1. Provide 3-4 restaurants of different price ranges
2. Include 4-5 must-see sightseeing spots
3. Suggest 3-4 unique activities/experiences
4. Give 4-5 practical local tips
5. Cover main transportation options
6. Consider the season/month for weather
7. Be specific to ${trip.destination}, not generic advice
8. Return valid JSON only
`;
  }

  private generateBasicInsights(trip: Trip, events: TravelEvent[]): string {
    const insights = [
      `You have ${events.length} bookings planned for your trip to ${trip.destination}.`,
    ];

    const flightCount = events.filter(e => e.type === 'flight').length;
    const hotelCount = events.filter(e => e.type === 'hotel').length;

    if (flightCount > 0) {
      insights.push(`Remember to check in for your flights 24 hours before departure.`);
    }

    if (hotelCount > 0) {
      insights.push(`Consider checking hotel check-in/out times to plan your arrival and departure.`);
    }

    if (trip.destination) {
      insights.push(`Don't forget to research local customs and tipping practices in ${trip.destination}.`);
    }

    return insights.join(' ');
  }
}