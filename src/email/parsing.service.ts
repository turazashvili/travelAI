import { Injectable } from '@nestjs/common';
import { AIParsingService } from './ai-parsing.service';

interface LegacyParseResult {
  type: string;
  confidence: number;
  extractedData: {
    title: string;
    startDateTime?: Date;
    endDateTime?: Date;
    location?: {
      address?: string;
      city?: string;
      country?: string;
      airport?: string;
    };
    confirmationNumber?: string;
    provider?: string;
    passengers?: string[];
    cost?: string;
    [key: string]: any;
  };
}

export interface ParseResult {
  events: Array<{
    type: string;
    title: string;
    startDateTime?: Date;
    endDateTime?: Date;
    location?: {
      address?: string;
      city?: string;
      country?: string;
      airport?: string;
    };
    confirmationNumber?: string;
    provider?: string;
    parsedData: Record<string, any>;
    confidence: number;
  }>;
  confidence: number;
  summary: string;
}

@Injectable()
export class ParsingService {
  constructor(private aiParsingService: AIParsingService) {}

  async parseEmail(emailContent: string, subject: string): Promise<ParseResult> {
    // Try AI parsing first (most accurate)
    const aiResult = await this.aiParsingService.parseEmailWithAI(emailContent, subject);
    if (aiResult && aiResult.events.length > 0) {
      return {
        events: this.aiParsingService.convertAIResultToEvents(aiResult),
        confidence: aiResult.confidence,
        summary: aiResult.summary,
      };
    }

    // Fallback to heuristic parsing
    console.log('AI parsing failed or unavailable, using heuristic parsing');
    return this.parseWithHeuristics(emailContent, subject);
  }

  private parseWithHeuristics(emailContent: string, subject: string): ParseResult {
    // Try different parsing strategies in order of confidence
    const legacyResult = this.parseByTemplatesLegacy(emailContent, subject) ||
                        this.parseByHeuristicsLegacy(emailContent, subject) ||
                        this.parseFallbackLegacy(emailContent, subject);

    // Convert legacy result to new format
    return {
      events: [{
        type: legacyResult.type,
        title: legacyResult.extractedData.title,
        startDateTime: legacyResult.extractedData.startDateTime,
        endDateTime: legacyResult.extractedData.endDateTime,
        location: legacyResult.extractedData.location,
        confirmationNumber: legacyResult.extractedData.confirmationNumber,
        provider: legacyResult.extractedData.provider,
        parsedData: legacyResult.extractedData,
        confidence: legacyResult.confidence,
      }],
      confidence: legacyResult.confidence,
      summary: `Parsed ${legacyResult.type} booking using heuristic methods`,
    };
  }

  private parseByTemplatesLegacy(emailContent: string, subject: string): LegacyParseResult | null {
    // Flight patterns
    if (this.isFlightEmail(emailContent, subject)) {
      return this.parseFlightEmail(emailContent, subject);
    }

    // Hotel patterns
    if (this.isHotelEmail(emailContent, subject)) {
      return this.parseHotelEmail(emailContent, subject);
    }

    // Restaurant patterns
    if (this.isRestaurantEmail(emailContent, subject)) {
      return this.parseRestaurantEmail(emailContent, subject);
    }

    return null;
  }

  private parseByHeuristicsLegacy(emailContent: string, subject: string): LegacyParseResult | null {
    const extractedData: any = {
      title: this.extractTitle(subject, emailContent),
    };

    // Extract common fields
    const confirmationNumber = this.extractConfirmationNumber(emailContent);
    if (confirmationNumber) {
      extractedData.confirmationNumber = confirmationNumber;
    }

    const dates = this.extractDates(emailContent);
    if (dates.length > 0) {
      extractedData.startDateTime = dates[0];
      if (dates.length > 1) {
        extractedData.endDateTime = dates[1];
      }
    }

    const location = this.extractLocation(emailContent);
    if (location) {
      extractedData.location = location;
    }

    const provider = this.extractProvider(emailContent, subject);
    if (provider) {
      extractedData.provider = provider;
    }

    // Determine type based on content
    const type = this.detectType(emailContent, subject);

    return {
      type,
      confidence: 0.6,
      extractedData,
    };
  }

  private parseFallbackLegacy(emailContent: string, subject: string): LegacyParseResult {
    return {
      type: 'other',
      confidence: 0.3,
      extractedData: {
        title: this.extractTitle(subject, emailContent),
        provider: this.extractProvider(emailContent, subject),
      },
    };
  }

  // Flight email parsing
  private isFlightEmail(emailContent: string, subject: string): boolean {
    const flightKeywords = [
      'flight', 'boarding pass', 'airline', 'departure', 'arrival',
      'gate', 'seat', 'terminal', 'check-in', 'itinerary'
    ];
    
    const content = (emailContent + ' ' + subject).toLowerCase();
    return flightKeywords.some(keyword => content.includes(keyword));
  }

  private parseFlightEmail(emailContent: string, subject: string): LegacyParseResult {
    const extractedData: any = {
      title: this.extractTitle(subject, emailContent),
    };

    // Extract flight-specific data
    const flightNumber = this.extractFlightNumber(emailContent);
    if (flightNumber) {
      extractedData.flightNumber = flightNumber;
    }

    const airports = this.extractAirports(emailContent);
    if (airports.departure) {
      extractedData.departure = airports.departure;
    }
    if (airports.arrival) {
      extractedData.arrival = airports.arrival;
      extractedData.location = { airport: airports.arrival, city: airports.arrival };
    }

    const times = this.extractFlightTimes(emailContent);
    if (times.departure) {
      extractedData.startDateTime = times.departure;
    }
    if (times.arrival) {
      extractedData.endDateTime = times.arrival;
    }

    const confirmationNumber = this.extractConfirmationNumber(emailContent);
    if (confirmationNumber) {
      extractedData.confirmationNumber = confirmationNumber;
    }

    const airline = this.extractAirline(emailContent, subject);
    if (airline) {
      extractedData.provider = airline;
    }

    return {
      type: 'flight',
      confidence: 0.8,
      extractedData,
    };
  }

  // Hotel email parsing
  private isHotelEmail(emailContent: string, subject: string): boolean {
    const hotelKeywords = [
      'hotel', 'reservation', 'booking', 'check-in', 'check-out',
      'room', 'stay', 'accommodation', 'nights'
    ];
    
    const content = (emailContent + ' ' + subject).toLowerCase();
    return hotelKeywords.some(keyword => content.includes(keyword));
  }

  private parseHotelEmail(emailContent: string, subject: string): LegacyParseResult {
    const extractedData: any = {
      title: this.extractTitle(subject, emailContent),
    };

    const dates = this.extractDates(emailContent);
    if (dates.length >= 2) {
      extractedData.startDateTime = dates[0]; // Check-in
      extractedData.endDateTime = dates[1];   // Check-out
    }

    const location = this.extractLocation(emailContent);
    if (location) {
      extractedData.location = location;
    }

    const confirmationNumber = this.extractConfirmationNumber(emailContent);
    if (confirmationNumber) {
      extractedData.confirmationNumber = confirmationNumber;
    }

    const hotelName = this.extractHotelName(emailContent, subject);
    if (hotelName) {
      extractedData.provider = hotelName;
    }

    return {
      type: 'hotel',
      confidence: 0.8,
      extractedData,
    };
  }

  // Restaurant email parsing
  private isRestaurantEmail(emailContent: string, subject: string): boolean {
    const restaurantKeywords = [
      'reservation', 'table', 'restaurant', 'dining', 'opentable',
      'resy', 'dinner', 'lunch', 'party of'
    ];
    
    const content = (emailContent + ' ' + subject).toLowerCase();
    return restaurantKeywords.some(keyword => content.includes(keyword));
  }

  private parseRestaurantEmail(emailContent: string, subject: string): LegacyParseResult {
    const extractedData: any = {
      title: this.extractTitle(subject, emailContent),
    };

    const dates = this.extractDates(emailContent);
    if (dates.length > 0) {
      extractedData.startDateTime = dates[0];
    }

    const location = this.extractLocation(emailContent);
    if (location) {
      extractedData.location = location;
    }

    const confirmationNumber = this.extractConfirmationNumber(emailContent);
    if (confirmationNumber) {
      extractedData.confirmationNumber = confirmationNumber;
    }

    const restaurantName = this.extractRestaurantName(emailContent, subject);
    if (restaurantName) {
      extractedData.provider = restaurantName;
    }

    const partySize = this.extractPartySize(emailContent);
    if (partySize) {
      extractedData.partySize = partySize;
    }

    return {
      type: 'restaurant',
      confidence: 0.8,
      extractedData,
    };
  }

  // Utility extraction methods
  private extractTitle(subject: string, emailContent: string): string {
    // Clean up subject line
    const cleanedSubject = subject
      .replace(/^(re:|fwd?:|confirmation|booking)/i, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    if (cleanedSubject && cleanedSubject.length > 5) {
      return cleanedSubject;
    }

    // Extract from first line of email
    const lines = emailContent.split('\n').filter(line => line.trim().length > 0);
    return lines[0]?.substring(0, 100) || 'Travel Booking';
  }

  private extractConfirmationNumber(emailContent: string): string | null {
    const patterns = [
      /confirmation\s*(?:number|code|#)?\s*:?\s*([A-Z0-9]{6,})/i,
      /booking\s*(?:reference|number|code|#)?\s*:?\s*([A-Z0-9]{6,})/i,
      /reference\s*(?:number|code|#)?\s*:?\s*([A-Z0-9]{6,})/i,
      /record\s*locator\s*:?\s*([A-Z0-9]{6,})/i,
    ];

    for (const pattern of patterns) {
      const match = emailContent.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  private extractDates(emailContent: string): Date[] {
    const datePatterns = [
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
    ];

    const dates: Date[] = [];
    for (const pattern of datePatterns) {
      const matches = emailContent.match(pattern);
      if (matches) {
        for (const match of matches) {
          const date = new Date(match);
          if (!isNaN(date.getTime())) {
            dates.push(date);
          }
        }
      }
    }

    return dates.sort((a, b) => a.getTime() - b.getTime());
  }

  private extractLocation(emailContent: string): any | null {
    // Simple location extraction - can be enhanced
    const locationPatterns = [
      /address\s*:?\s*(.+?)(?:\n|$)/i,
      /location\s*:?\s*(.+?)(?:\n|$)/i,
      /\b\d+\s+[A-Za-z\s]+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)[A-Za-z\s,]*\d{5}/i,
    ];

    for (const pattern of locationPatterns) {
      const match = emailContent.match(pattern);
      if (match) {
        return { address: match[1].trim() };
      }
    }
    return null;
  }

  private extractProvider(emailContent: string, subject: string): string | null {
    // Extract from sender or email signatures
    const fromMatch = emailContent.match(/from\s*:?\s*(.+?)(?:\n|<)/i);
    if (fromMatch) {
      return fromMatch[1].trim();
    }
    return null;
  }

  private detectType(emailContent: string, subject: string): string {
    const content = (emailContent + ' ' + subject).toLowerCase();
    
    if (content.includes('flight') || content.includes('airline')) return 'flight';
    if (content.includes('hotel') || content.includes('room')) return 'hotel';
    if (content.includes('car') || content.includes('rental')) return 'car';
    if (content.includes('restaurant') || content.includes('table')) return 'restaurant';
    if (content.includes('activity') || content.includes('tour')) return 'activity';
    if (content.includes('train') || content.includes('railway')) return 'train';
    if (content.includes('bus')) return 'bus';
    
    return 'other';
  }

  // Specific extraction methods for flight data
  private extractFlightNumber(emailContent: string): string | null {
    const pattern = /flight\s*(?:number|#)?\s*:?\s*([A-Z]{2}\d+)/i;
    const match = emailContent.match(pattern);
    return match ? match[1] : null;
  }

  private extractAirports(emailContent: string): { departure?: string; arrival?: string } {
    // Simple airport code extraction
    const airportPattern = /\b[A-Z]{3}\b/g;
    const matches = emailContent.match(airportPattern);
    
    if (matches && matches.length >= 2) {
      return {
        departure: matches[0],
        arrival: matches[1],
      };
    }
    return {};
  }

  private extractFlightTimes(emailContent: string): { departure?: Date; arrival?: Date } {
    // Extract times - this is simplified
    const timePattern = /\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/gi;
    const times = emailContent.match(timePattern);
    
    if (times && times.length >= 2) {
      return {
        departure: new Date(`2024-01-01 ${times[0]}`),
        arrival: new Date(`2024-01-01 ${times[1]}`),
      };
    }
    return {};
  }

  private extractAirline(emailContent: string, subject: string): string | null {
    const airlines = ['American', 'Delta', 'United', 'Southwest', 'JetBlue', 'Alaska'];
    const content = emailContent + ' ' + subject;
    
    for (const airline of airlines) {
      if (content.includes(airline)) {
        return airline;
      }
    }
    return null;
  }

  private extractHotelName(emailContent: string, subject: string): string | null {
    const hotelChains = ['Marriott', 'Hilton', 'Hyatt', 'Holiday Inn', 'Sheraton'];
    const content = emailContent + ' ' + subject;
    
    for (const hotel of hotelChains) {
      if (content.includes(hotel)) {
        return hotel;
      }
    }
    return null;
  }

  private extractRestaurantName(emailContent: string, subject: string): string | null {
    // Extract restaurant name from subject or content
    const namePattern = /(?:reservation\s+at|table\s+at)\s+([A-Za-z\s]+)/i;
    const match = (emailContent + ' ' + subject).match(namePattern);
    return match ? match[1].trim() : null;
  }

  private extractPartySize(emailContent: string): number | null {
    const pattern = /party\s+of\s+(\d+)/i;
    const match = emailContent.match(pattern);
    return match ? parseInt(match[1]) : null;
  }
}