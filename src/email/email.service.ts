import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as postmark from 'postmark';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model';
import { Trip } from '../models/trip.model';
import { TravelEvent } from '../models/travel-event.model';
import { DestinationAIService } from './destination-ai.service';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  private postmarkClient: postmark.ServerClient;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Trip.name) private tripModel: Model<Trip>,
    @InjectModel(TravelEvent.name) private travelEventModel: Model<TravelEvent>,
    private destinationAIService: DestinationAIService,
    private emailTemplateService: EmailTemplateService,
  ) {
    this.postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
  }

  async findOrCreateUser(email: string): Promise<User> {
    let user = await this.userModel.findOne({ email });
    if (!user) {
      user = new this.userModel({ email });
      await user.save();
    }
    return user;
  }

  async createNewTrip(userEmail: string): Promise<Trip> {
    const user = await this.findOrCreateUser(userEmail);
    
    const forwardingAddress = `trip-${uuidv4().substring(0, 8)}@${process.env.EMAIL_DOMAIN || 'travelbuilder.com'}`;
    
    const trip = new this.tripModel({
      userId: user._id,
      forwardingAddress,
      isActive: true,
    });
    
    await trip.save();
    
    user.trips.push(trip._id.toString());
    await user.save();
    
    return trip;
  }

  async findTripByForwardingAddress(address: string): Promise<Trip | null> {
    return this.tripModel.findOne({ forwardingAddress: address, isActive: true });
  }

  async sendWelcomeEmail(userEmail: string, forwardingAddress: string): Promise<void> {
    const htmlContent = this.emailTemplateService.generateWelcomeEmailHTML(forwardingAddress);

    await this.postmarkClient.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@travelbuilder.com',
      To: userEmail,
      Subject: 'Your Trip Address is Ready! 📧',
      HtmlBody: htmlContent,
      TextBody: `Hi there! Your new trip address is: ${forwardingAddress}. Forward any booking confirmations to this address and I'll automatically build your itinerary. To get your complete itinerary, email this address with subject: GET ITINERARY. Happy travels!`,
    });
  }

  async sendBookingConfirmation(userEmail: string, eventTitle: string, eventType: string): Promise<void> {
    const htmlContent = this.emailTemplateService.generateBookingConfirmationHTML(eventTitle, eventType);
    const emoji = this.getEmojiForType(eventType);

    await this.postmarkClient.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@travelbuilder.com',
      To: userEmail,
      Subject: `✅ Added to your trip: ${eventTitle}`,
      HtmlBody: htmlContent,
      TextBody: `Great! I've added this to your trip: ${emoji} ${eventTitle}. Your trip is being updated automatically. Email with "GET ITINERARY" to see the full timeline.`,
    });
  }

  async sendItineraryEmail(userEmail: string, trip: Trip, events: TravelEvent[]): Promise<void> {
    console.log('🤖 Generating AI-powered itinerary...');
    
    // Generate AI suggestions and insights in parallel
    const [suggestions, insights] = await Promise.all([
      this.destinationAIService.generateDestinationSuggestions(trip, events),
      this.destinationAIService.generateTravelInsights(trip, events),
    ]);

    console.log('📊 AI Generation Results:');
    console.log('- Suggestions generated:', !!suggestions);
    console.log('- Insights generated:', !!insights);
    if (suggestions) {
      console.log('- Suggestions structure:', {
        restaurants: suggestions.restaurants?.length || 0,
        sightseeing: suggestions.sightseeing?.length || 0,
        activities: suggestions.activities?.length || 0,
        dailyPlans: suggestions.dailyPlans?.length || 0,
        hasLinks: suggestions.restaurants?.[0]?.googleMapsUrl ? 'YES' : 'NO',
      });
    }

    // Generate HTML email with AI suggestions
    const htmlContent = this.emailTemplateService.generateItineraryEmailHTML(
      trip, 
      events, 
      suggestions, 
      insights
    );

    // Generate fallback text content
    const textContent = this.generateFallbackTextItinerary(trip, events, insights);

    console.log(`📧 Sending enhanced itinerary to ${userEmail}`);
    
    await this.postmarkClient.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@travelbuilder.com',
      To: userEmail,
      Subject: '🗓️ Your AI-Enhanced Travel Itinerary',
      HtmlBody: htmlContent,
      TextBody: textContent,
    });
  }

  private generateFallbackTextItinerary(trip: Trip, events: TravelEvent[], insights?: string): string {
    const sortedEvents = events.sort((a, b) => 
      (a.startDateTime || a.createdAt).getTime() - (b.startDateTime || b.createdAt).getTime()
    );

    let content = `🗓️ Your Complete Itinerary\n\n`;
    
    if (trip.destination) {
      content += `📍 DESTINATION: ${trip.destination}\n`;
    }
    
    if (trip.startDate && trip.endDate) {
      content += `📅 DATES: ${trip.startDate.toDateString()} - ${trip.endDate.toDateString()}\n`;
    }
    
    content += `\nTIMELINE:\n─────────\n\n`;

    let currentDate = '';
    for (const event of sortedEvents) {
      const eventDate = event.startDateTime ? event.startDateTime.toDateString() : event.createdAt.toDateString();
      
      if (eventDate !== currentDate) {
        currentDate = eventDate;
        content += `[${eventDate}]\n`;
      }
      
      const time = event.startDateTime ? event.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const emoji = this.getEmojiForType(event.type);
      
      content += `${time ? `🕐 ${time} - ` : ''}${emoji} ${event.title}\n`;
      
      if (event.location?.address) {
        content += `📍 ${event.location.address}\n`;
      }
      
      if (event.confirmationNumber) {
        content += `🔗 Confirmation: ${event.confirmationNumber}\n`;
      }
      
      content += `\n`;
    }

    if (insights) {
      content += `\n🧠 AI Travel Insights:\n${insights}\n\n`;
    }

    content += `Total bookings: ${events.length}\nSafe travels! 🌟\n\nGenerated by AI-powered Travel Itinerary Builder`;

    return content;
  }

  private getEmojiForType(type: string): string {
    const emojiMap = {
      flight: '✈️',
      hotel: '🏨',
      car: '🚗',
      restaurant: '🍽️',
      activity: '🎫',
      train: '🚂',
      bus: '🚌',
      taxi: '🚕',
      other: '📋',
    };
    
    return emojiMap[type.toLowerCase()] || '📋';
  }
}