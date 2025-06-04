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
            content: `You are a comprehensive travel expert and local guide. Generate complete travel recommendations with ALL required fields including links, prices, and detailed information. You must respond using the generate_suggestions function only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        functions: [
          {
            name: "generate_suggestions",
            description: "Generate comprehensive travel destination recommendations",
            parameters: {
              type: "object",
              properties: {
                restaurants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      cuisine: { type: "string" },
                      description: { type: "string" },
                      priceRange: { type: "string" },
                      location: { type: "string" },
                      googleMapsUrl: { type: "string" },
                      website: { type: "string" },
                      rating: { type: "string" },
                      specialDishes: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "cuisine", "description", "priceRange", "location", "googleMapsUrl", "rating", "specialDishes"]
                  }
                },
                sightseeing: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      description: { type: "string" },
                      estimatedTime: { type: "string" },
                      location: { type: "string" },
                      googleMapsUrl: { type: "string" },
                      website: { type: "string" },
                      entranceFee: { type: "string" },
                      bestTimeToVisit: { type: "string" }
                    },
                    required: ["name", "type", "description", "estimatedTime", "location", "googleMapsUrl", "entranceFee", "bestTimeToVisit"]
                  }
                },
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      type: { type: "string" },
                      description: { type: "string" },
                      duration: { type: "string" },
                      location: { type: "string" },
                      googleMapsUrl: { type: "string" },
                      website: { type: "string" },
                      price: { type: "string" },
                      bookingRequired: { type: "boolean" }
                    },
                    required: ["name", "type", "description", "duration", "location", "googleMapsUrl", "price", "bookingRequired"]
                  }
                },
                dailyPlans: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "number" },
                      title: { type: "string" },
                      theme: { type: "string" },
                      activities: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            time: { type: "string" },
                            activity: { type: "string" },
                            location: { type: "string" },
                            notes: { type: "string" },
                            estimatedCost: { type: "string" }
                          },
                          required: ["time", "activity", "location", "estimatedCost"]
                        }
                      }
                    },
                    required: ["day", "title", "theme", "activities"]
                  }
                },
                navigationFromHotel: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      destination: { type: "string" },
                      method: { type: "string" },
                      duration: { type: "string" },
                      cost: { type: "string" },
                      instructions: { type: "string" }
                    },
                    required: ["destination", "method", "duration", "cost", "instructions"]
                  }
                },
                localTips: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      tip: { type: "string" },
                      importance: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["category", "tip", "importance"]
                  }
                },
                transportation: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      description: { type: "string" },
                      cost: { type: "string" },
                      downloadApps: { type: "array", items: { type: "string" } },
                      tips: { type: "string" }
                    },
                    required: ["type", "description", "cost", "downloadApps"]
                  }
                },
                weather: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    suggestion: { type: "string" },
                    whatToPack: { type: "array", items: { type: "string" } }
                  },
                  required: ["description", "suggestion", "whatToPack"]
                },
                culturalEtiquette: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      advice: { type: "string" }
                    },
                    required: ["category", "advice"]
                  }
                }
              },
              required: ["restaurants", "sightseeing", "activities", "dailyPlans", "navigationFromHotel", "localTips", "transportation", "weather", "culturalEtiquette"]
            }
          }
        ],
        function_call: { name: "generate_suggestions" },
        temperature: 0.3,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message;
      if (!response || !response.function_call) {
        throw new Error('No function call response from OpenAI');
      }

      console.log('🤖 Function call received:', response.function_call.name);
      console.log('🔍 Arguments length:', response.function_call.arguments.length);
      
      // Parse the function call arguments
      let parsed: DestinationSuggestions;
      try {
        parsed = JSON.parse(response.function_call.arguments) as DestinationSuggestions;
        console.log('✅ Function call arguments parsed successfully');
        console.log('📊 Response structure:', {
          restaurants: parsed.restaurants?.length || 0,
          sightseeing: parsed.sightseeing?.length || 0,
          activities: parsed.activities?.length || 0,
          dailyPlans: parsed.dailyPlans?.length || 0,
          hasNavigation: !!parsed.navigationFromHotel,
          hasLocalTips: !!parsed.localTips,
          hasTransportation: !!parsed.transportation,
          hasWeather: !!parsed.weather,
          hasCulturalEtiquette: !!parsed.culturalEtiquette,
          hasLinks: parsed.restaurants?.[0]?.googleMapsUrl ? 'YES' : 'NO',
        });
      } catch (parseError) {
        console.error('❌ Function call parsing failed:', parseError);
        console.log('🔍 Function arguments:', response.function_call.arguments.substring(0, 500));
        throw new Error('Failed to parse function call arguments as JSON');
      }
      
      // Validate and clean the response
      const validated = this.validateAndCleanAIResponse(parsed);
      console.log('✅ AI response validated and cleaned');
      return validated;
      
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

Provide exactly 3 helpful, personalized insights for this specific trip. Format as:

1. **Category Title**: Detailed practical advice with specific recommendations.
2. **Category Title**: Detailed practical advice with specific recommendations.  
3. **Category Title**: Detailed practical advice with specific recommendations.

Categories should be relevant like: Local Transportation, Cultural Experiences, Food & Dining, Safety Tips, Money-Saving Tips, Best Times to Visit, Local Customs, Weather Considerations, etc.

Make each insight specific to ${trip.destination} with actionable advice. Each point should be 2-3 sentences with practical details.
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel advisor. Provide concise, practical travel insights in the exact format requested. Always format with numbered points and bold category titles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 400,
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

CRITICAL REQUIREMENTS:
1. Provide 4-5 restaurants with real Google Maps search URLs (format: https://maps.google.com/search/restaurant+name+${trip.destination})
2. Include 5-6 must-see attractions with entrance fees and timing
3. Suggest 4-5 unique activities with booking requirements and prices
4. Create ${Math.min(duration, 5)} daily plans with specific times and activities
5. Give navigation from ${hotelLocation} to 4-6 popular destinations
6. Provide categorized local tips with importance levels (high/medium/low)
7. Include app recommendations and cultural etiquette sections
8. Consider the season/month ${currentMonth} for weather and packing
9. Be specific to ${trip.destination} with real place names and locations
10. ALL Google Maps URLs must be real and functional
11. Fill ALL fields in the JSON structure - no null or empty values except where specified
12. Return ONLY valid JSON with complete data structure
13. Price information must be realistic and current
14. Include specific app names for transportation
15. Packing list must be detailed and seasonal

VALIDATION CHECKLIST:
✓ All restaurants have googleMapsUrl and rating
✓ All attractions have entranceFee and bestTimeToVisit  
✓ All activities have price and bookingRequired fields
✓ Daily plans have realistic times and costs
✓ Navigation includes specific instructions
✓ Local tips are categorized with importance levels
✓ Transportation includes downloadApps arrays
✓ Weather has whatToPack array with 6+ items
✓ Cultural etiquette has multiple categories
✓ All required fields are filled
`;
  }

  private validateAndCleanAIResponse(parsed: DestinationSuggestions): DestinationSuggestions {
    // Ensure all required arrays exist
    parsed.restaurants = parsed.restaurants || [];
    parsed.sightseeing = parsed.sightseeing || [];
    parsed.activities = parsed.activities || [];
    parsed.dailyPlans = parsed.dailyPlans || [];
    parsed.navigationFromHotel = parsed.navigationFromHotel || [];
    parsed.localTips = parsed.localTips || [];
    parsed.transportation = parsed.transportation || [];
    parsed.culturalEtiquette = parsed.culturalEtiquette || [];

    // Ensure weather object exists
    if (!parsed.weather) {
      parsed.weather = {
        description: 'Weather information not available',
        suggestion: 'Check local weather before travel',
        whatToPack: ['weather-appropriate clothing'],
      };
    }

    // Validate restaurants
    parsed.restaurants = parsed.restaurants.map(restaurant => ({
      ...restaurant,
      name: restaurant.name || 'Local Restaurant',
      cuisine: restaurant.cuisine || 'Local',
      description: restaurant.description || 'Popular local restaurant',
      priceRange: restaurant.priceRange || '$$',
      location: restaurant.location || 'City center',
      rating: restaurant.rating || '4.0/5',
      specialDishes: restaurant.specialDishes || [],
      googleMapsUrl: restaurant.googleMapsUrl || `https://maps.google.com/search/${encodeURIComponent(restaurant.name || 'restaurant')}`,
    }));

    // Validate activities
    parsed.activities = parsed.activities.map(activity => ({
      ...activity,
      name: activity.name || 'Local Activity',
      type: activity.type || 'Experience',
      description: activity.description || 'Popular local activity',
      duration: activity.duration || 'Half day',
      location: activity.location || 'City area',
      price: activity.price || 'Varies',
      bookingRequired: activity.bookingRequired !== undefined ? activity.bookingRequired : false,
      googleMapsUrl: activity.googleMapsUrl || `https://maps.google.com/search/${encodeURIComponent(activity.name || 'activity')}`,
    }));

    return parsed;
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