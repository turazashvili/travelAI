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
    googleMapsUrl?: string;
    website?: string;
    photoUrl?: string;
    rating?: string;
    specialDishes?: string[];
  }>;
  sightseeing: Array<{
    name: string;
    type: string;
    description: string;
    estimatedTime: string;
    location: string;
    googleMapsUrl?: string;
    website?: string;
    photoUrl?: string;
    entranceFee?: string;
    bestTimeToVisit?: string;
  }>;
  activities: Array<{
    name: string;
    type: string;
    description: string;
    duration: string;
    location: string;
    googleMapsUrl?: string;
    website?: string;
    photoUrl?: string;
    price?: string;
    bookingRequired?: boolean;
  }>;
  dailyPlans: Array<{
    day: number;
    title: string;
    theme: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      notes?: string;
      estimatedCost?: string;
    }>;
  }>;
  navigationFromHotel: Array<{
    destination: string;
    method: string;
    duration: string;
    cost: string;
    instructions: string;
  }>;
  localTips: Array<{
    category: string;
    tip: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  transportation: Array<{
    type: string;
    description: string;
    cost: string;
    downloadApps?: string[];
    tips?: string;
  }>;
  weather: {
    description: string;
    suggestion: string;
    whatToPack: string[];
  };
  culturalEtiquette: Array<{
    category: string;
    advice: string;
  }>;
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
    
    // Get hotel information if available
    const hotelEvent = events.find(e => e.type === 'hotel');
    const hotelLocation = hotelEvent?.location?.address || hotelEvent?.title || 'hotel area';
    
    return `
Generate comprehensive travel recommendations for a trip to ${trip.destination}.

TRIP DETAILS:
- Destination: ${trip.destination}
- Duration: ${duration} days
- Month: ${currentMonth}
- Hotel/Accommodation: ${hotelLocation}
- Existing bookings: ${events.map(e => `${e.type} (${e.title})`).join(', ')}

Return a JSON object with this exact structure (include all fields):

{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Type of cuisine", 
      "description": "Brief description and why it's recommended",
      "priceRange": "$$ | $$$ | $$$$",
      "location": "Area/district in the city",
      "googleMapsUrl": "https://maps.google.com/search/restaurant+name+${trip.destination}",
      "website": "official website if known or null",
      "rating": "4.5/5 stars",
      "specialDishes": ["dish1", "dish2"]
    }
  ],
  "sightseeing": [
    {
      "name": "Attraction Name",
      "type": "Museum/Park/Historic Site/etc",
      "description": "What makes this special and worth visiting",
      "estimatedTime": "2-3 hours",
      "location": "Area/district",
      "googleMapsUrl": "https://maps.google.com/search/attraction+name+${trip.destination}",
      "website": "official website if known or null",
      "entranceFee": "Free | $10 | $20-30",
      "bestTimeToVisit": "Morning | Afternoon | Evening"
    }
  ],
  "activities": [
    {
      "name": "Activity Name",
      "type": "Tour/Adventure/Cultural/etc",
      "description": "What the activity involves",
      "duration": "Half day/Full day/2 hours",
      "location": "Where it takes place",
      "googleMapsUrl": "https://maps.google.com/search/activity+name+${trip.destination}",
      "website": "booking website if known or null",
      "price": "$50-100 per person",
      "bookingRequired": true
    }
  ],
  "dailyPlans": [
    {
      "day": 1,
      "title": "Arrival & City Center",
      "theme": "Getting oriented",
      "activities": [
        {
          "time": "10:00 AM",
          "activity": "Check-in and explore nearby area",
          "location": "Hotel area",
          "notes": "Get oriented, grab local SIM card",
          "estimatedCost": "$20"
        }
      ]
    }
  ],
  "navigationFromHotel": [
    {
      "destination": "City Center",
      "method": "Taxi/Metro/Bus",
      "duration": "20-30 minutes",
      "cost": "$5-10",
      "instructions": "Take bus line X or use Grab app"
    }
  ],
  "localTips": [
    {
      "category": "Transportation",
      "tip": "Download Grab app for convenient rides",
      "importance": "high"
    }
  ],
  "transportation": [
    {
      "type": "Ride-hailing",
      "description": "How to get around efficiently",
      "cost": "Approximate cost range",
      "downloadApps": ["Grab", "GoJek"],
      "tips": "Always check driver rating"
    }
  ],
  "weather": {
    "description": "Expected weather for month ${currentMonth}",
    "suggestion": "What to pack or expect",
    "whatToPack": ["sunscreen", "light jacket", "umbrella"]
  },
  "culturalEtiquette": [
    {
      "category": "Dining",
      "advice": "Remove shoes when entering homes"
    }
  ]
}

REQUIREMENTS:
1. Provide 4-5 restaurants with real Google Maps search URLs
2. Include 5-6 must-see attractions with entrance fees and timing
3. Suggest 4-5 unique activities with booking requirements
4. Create ${duration} daily plans with specific times and activities
5. Give navigation from ${hotelLocation} to popular destinations
6. Provide categorized local tips with importance levels
7. Include app recommendations and cultural etiquette
8. Consider the season/month ${currentMonth} for weather and activities
9. Be specific to ${trip.destination} with real place names
10. All Google Maps URLs should be real search URLs
11. Return valid JSON only with ALL required fields
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