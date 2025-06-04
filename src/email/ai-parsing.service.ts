import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

export interface AIParseResult {
  events: Array<{
    type: string;
    title: string;
    startDateTime?: string;
    endDateTime?: string;
    location?: {
      address?: string;
      city?: string;
      country?: string;
      airport?: string;
      coordinates?: [number, number];
    };
    confirmationNumber?: string;
    provider?: string;
    details: Record<string, any>;
  }>;
  confidence: number;
  summary: string;
}

@Injectable()
export class AIParsingService {
  private openai: OpenAI;

  constructor() {
    if (process.env.OPENAI_API_TOKEN) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_TOKEN,
      });
    }
  }

  async parseEmailWithAI(emailContent: string, subject: string): Promise<AIParseResult | null> {
    if (!this.openai) {
      console.log('OpenAI not configured, skipping AI parsing');
      return null;
    }

    try {
      const prompt = this.buildParsingPrompt(emailContent, subject);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel booking parser. Extract structured travel information from emails and return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const parsed = JSON.parse(response) as AIParseResult;
      
      // Validate and clean the response
      return this.validateAndCleanAIResponse(parsed);
      
    } catch (error) {
      console.error('AI parsing failed:', error);
      return null;
    }
  }

  private buildParsingPrompt(emailContent: string, subject: string): string {
    return `
Parse this travel booking email and extract structured information. Return a JSON object with this exact structure:

{
  "events": [
    {
      "type": "flight|hotel|car|restaurant|activity|train|bus|other",
      "title": "descriptive title",
      "startDateTime": "ISO 8601 datetime or null",
      "endDateTime": "ISO 8601 datetime or null", 
      "location": {
        "address": "full address",
        "city": "city name",
        "country": "country name",
        "airport": "airport code if applicable"
      },
      "confirmationNumber": "booking reference",
      "provider": "company/airline/hotel name",
      "details": {
        "flightNumber": "for flights",
        "departure": {"airport": "XXX", "time": "ISO datetime", "terminal": "T1"},
        "arrival": {"airport": "XXX", "time": "ISO datetime", "terminal": "T1"},
        "roomType": "for hotels",
        "guests": "number of guests",
        "checkIn": "ISO datetime for hotels",
        "checkOut": "ISO datetime for hotels",
        "duration": "length of stay/flight duration",
        "price": "cost if mentioned",
        "any_other_relevant_details": "value"
      }
    }
  ],
  "confidence": 0.0-1.0,
  "summary": "brief description of what was parsed"
}

IMPORTANT RULES:
1. Extract ALL separate bookings/events from the email (flights, hotels, etc.)
2. For multi-segment flights, create separate events for each flight segment
3. Use proper ISO 8601 datetime format (YYYY-MM-DDTHH:mm:ss.sssZ)
4. If year is not specified, use 2025
5. Extract exact addresses, airport codes, confirmation numbers
6. Set confidence based on how much data was successfully extracted
7. Return ONLY valid JSON, no other text

EMAIL SUBJECT: ${subject}

EMAIL CONTENT:
${emailContent}
`;
  }

  private validateAndCleanAIResponse(parsed: AIParseResult): AIParseResult {
    // Ensure events array exists
    if (!parsed.events || !Array.isArray(parsed.events)) {
      parsed.events = [];
    }

    // Clean and validate each event
    parsed.events = parsed.events.map(event => {
      // Ensure required fields
      event.type = event.type || 'other';
      event.title = event.title || 'Travel Booking';
      event.details = event.details || {};

      // Validate datetime formats
      if (event.startDateTime) {
        try {
          new Date(event.startDateTime);
        } catch {
          event.startDateTime = undefined;
        }
      }

      if (event.endDateTime) {
        try {
          new Date(event.endDateTime);
        } catch {
          event.endDateTime = undefined;
        }
      }

      return event;
    });

    // Ensure confidence is a number between 0 and 1
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

    // Ensure summary exists
    parsed.summary = parsed.summary || 'Travel booking information extracted';

    return parsed;
  }

  // Helper method to convert AI result to our internal format
  convertAIResultToEvents(aiResult: AIParseResult): Array<any> {
    return aiResult.events.map(event => ({
      type: event.type,
      title: event.title,
      startDateTime: event.startDateTime ? new Date(event.startDateTime) : undefined,
      endDateTime: event.endDateTime ? new Date(event.endDateTime) : undefined,
      location: event.location,
      confirmationNumber: event.confirmationNumber,
      provider: event.provider,
      parsedData: {
        ...event.details,
        aiSummary: aiResult.summary,
      },
      confidence: aiResult.confidence,
    }));
  }
}