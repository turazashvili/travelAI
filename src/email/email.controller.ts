import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EmailService } from './email.service';
import { ParsingService } from './parsing.service';
import { ItineraryService } from './itinerary.service';
import { DestinationAIService } from './destination-ai.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/user.model';
import { Trip } from '../models/trip.model';

interface PostmarkInboundEmail {
  From: string;
  To: string;
  Subject: string;
  TextBody: string;
  HtmlBody?: string;
  Attachments?: any[];
}

@Controller('email')
export class EmailController {
  constructor(
    private emailService: EmailService,
    private parsingService: ParsingService,
    private itineraryService: ItineraryService,
    private destinationAIService: DestinationAIService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Trip.name) private tripModel: Model<Trip>,
  ) {}

  @Post('inbound')
  async handleInboundEmail(@Body() emailData: PostmarkInboundEmail) {
    try {
      const { From: fromEmail, To: toEmail, Subject: subject, TextBody: textBody } = emailData;
      
      console.log(`Received email from ${fromEmail} to ${toEmail} with subject: ${subject}`);

      // Route email based on subject and destination
      if (subject.toUpperCase().includes('NEW TRIP')) {
        await this.handleNewTripRequest(fromEmail);
      } else if (subject.toUpperCase().includes('GET ITINERARY')) {
        await this.handleItineraryRequest(fromEmail, toEmail);
      } else {
        await this.handleBookingEmail(fromEmail, toEmail, subject, textBody);
      }

      return { status: 'success', message: 'Email processed' };
    } catch (error) {
      console.error('Error processing email:', error);
      return { status: 'error', message: 'Failed to process email' };
    }
  }

  private async handleNewTripRequest(userEmail: string) {
    try {
      const trip = await this.emailService.createNewTrip(userEmail);
      await this.emailService.sendWelcomeEmail(userEmail, trip.forwardingAddress);
      console.log(`Created new trip for ${userEmail}: ${trip.forwardingAddress}`);
    } catch (error) {
      console.error('Error creating new trip:', error);
    }
  }

  private async handleItineraryRequest(userEmail: string, tripEmail: string) {
    try {
      const trip = await this.emailService.findTripByForwardingAddress(tripEmail);
      
      if (!trip) {
        console.log(`No active trip found for ${tripEmail}`);
        return;
      }

      const events = await this.itineraryService.getTripEvents(trip._id.toString());
      await this.emailService.sendItineraryEmail(userEmail, trip, events);
      console.log(`Sent itinerary to ${userEmail} for trip ${trip._id}`);
    } catch (error) {
      console.error('Error sending itinerary:', error);
    }
  }

  private async handleBookingEmail(userEmail: string, tripEmail: string, subject: string, textBody: string) {
    try {
      const trip = await this.emailService.findTripByForwardingAddress(tripEmail);
      
      if (!trip) {
        console.log(`No active trip found for ${tripEmail}`);
        return;
      }

      // Parse the email content
      const parseResult = await this.parsingService.parseEmail(textBody, subject);
      
      // Process all events from the parsing result
      const addedEvents = [];
      for (const eventData of parseResult.events) {
        const fullEventData = {
          ...eventData,
          rawEmailData: textBody,
        };

        const event = await this.itineraryService.addEventToTrip(trip._id.toString(), fullEventData);
        addedEvents.push(event);
        
        console.log(`Added ${event.type} event to trip ${trip._id}: ${event.title}`);
      }
      
      // Send confirmation email with summary
      if (addedEvents.length > 0) {
        const summary = addedEvents.length === 1 
          ? addedEvents[0].title 
          : `${addedEvents.length} bookings (${addedEvents.map(e => e.type).join(', ')})`;
        
        await this.emailService.sendBookingConfirmation(userEmail, summary, 'booking');
      }
      
    } catch (error) {
      console.error('Error processing booking email:', error);
    }
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('test-ai/:forwardingAddress')
  async testAIGeneration(@Param('forwardingAddress') forwardingAddress: string) {
    try {
      const trip = await this.emailService.findTripByForwardingAddress(forwardingAddress);
      if (!trip) {
        return { error: 'Trip not found' };
      }

      const events = await this.itineraryService.getTripEvents(trip._id.toString());
      
      console.log('🧪 Testing AI generation for trip:', trip._id);
      console.log('- Destination:', trip.destination);
      console.log('- Events count:', events.length);

      // Test AI generation
      const [suggestions, insights] = await Promise.all([
        this.destinationAIService.generateDestinationSuggestions(trip, events),
        this.destinationAIService.generateTravelInsights(trip, events),
      ]);

      return {
        trip: {
          destination: trip.destination,
          eventCount: events.length,
        },
        suggestions: suggestions ? {
          structure: {
            restaurants: suggestions.restaurants?.length || 0,
            sightseeing: suggestions.sightseeing?.length || 0,
            activities: suggestions.activities?.length || 0,
            dailyPlans: suggestions.dailyPlans?.length || 0,
            navigationFromHotel: suggestions.navigationFromHotel?.length || 0,
            localTips: suggestions.localTips?.length || 0,
            transportation: suggestions.transportation?.length || 0,
            weather: !!suggestions.weather,
            culturalEtiquette: suggestions.culturalEtiquette?.length || 0,
          },
          firstRestaurant: suggestions.restaurants?.[0] || null,
          firstActivity: suggestions.activities?.[0] || null,
        } : null,
        insights,
      };
    } catch (error) {
      console.error('Error testing AI generation:', error);
      return { error: 'Failed to test AI generation', details: error.message };
    }
  }

  @Get('trips/:forwardingAddress')
  async getTripByAddress(@Param('forwardingAddress') forwardingAddress: string) {
    try {
      const trip = await this.emailService.findTripByForwardingAddress(forwardingAddress);
      if (!trip) {
        return { error: 'Trip not found' };
      }

      const events = await this.itineraryService.getTripEvents(trip._id.toString());
      return {
        trip: {
          id: trip._id,
          forwardingAddress: trip.forwardingAddress,
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          isActive: trip.isActive,
        },
        events: events.map(event => ({
          id: event._id,
          type: event.type,
          title: event.title,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          location: event.location,
          confirmationNumber: event.confirmationNumber,
          provider: event.provider,
          confidence: event.confidence,
        }))
      };
    } catch (error) {
      console.error('Error fetching trip:', error);
      return { error: 'Failed to fetch trip' };
    }
  }
}