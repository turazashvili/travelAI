import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as postmark from 'postmark';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model';
import { Trip } from '../models/trip.model';
import { TravelEvent } from '../models/travel-event.model';

@Injectable()
export class EmailService {
  private postmarkClient: postmark.ServerClient;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Trip.name) private tripModel: Model<Trip>,
    @InjectModel(TravelEvent.name) private travelEventModel: Model<TravelEvent>,
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
    const emailContent = `
Hi there!

Your new trip address is: ${forwardingAddress}

Forward any booking confirmations to this address and I'll automatically build your itinerary.

Supported bookings:
✈️ Flights
🏨 Hotels
🚗 Car rentals
🍽️ Restaurant reservations
🎫 Activities & tours
📋 Any other travel-related confirmations

To get your complete itinerary, email this address with subject: GET ITINERARY

Happy travels!
    `.trim();

    await this.postmarkClient.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@travelbuilder.com',
      To: userEmail,
      Subject: 'Your Trip Address is Ready! 📧',
      TextBody: emailContent,
    });
  }

  async sendBookingConfirmation(userEmail: string, eventTitle: string, eventType: string): Promise<void> {
    const emoji = this.getEmojiForType(eventType);
    const emailContent = `
Great! I've added this to your trip:

${emoji} ${eventTitle}

Your trip is being updated automatically.
Email with "GET ITINERARY" to see the full timeline.
    `.trim();

    await this.postmarkClient.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@travelbuilder.com',
      To: userEmail,
      Subject: `✅ Added to your trip: ${eventTitle}`,
      TextBody: emailContent,
    });
  }

  async sendItineraryEmail(userEmail: string, trip: Trip, events: TravelEvent[]): Promise<void> {
    const sortedEvents = events.sort((a, b) => 
      (a.startDateTime || a.createdAt).getTime() - (b.startDateTime || b.createdAt).getTime()
    );

    let itineraryContent = `Here's your trip timeline:\n\n`;
    
    if (trip.destination) {
      itineraryContent += `📍 DESTINATION: ${trip.destination}\n`;
    }
    
    if (trip.startDate && trip.endDate) {
      itineraryContent += `📅 DATES: ${trip.startDate.toDateString()} - ${trip.endDate.toDateString()}\n`;
    }
    
    itineraryContent += `\nTIMELINE:\n─────────\n\n`;

    let currentDate = '';
    for (const event of sortedEvents) {
      const eventDate = event.startDateTime ? event.startDateTime.toDateString() : event.createdAt.toDateString();
      
      if (eventDate !== currentDate) {
        currentDate = eventDate;
        itineraryContent += `[${eventDate}]\n`;
      }
      
      const time = event.startDateTime ? event.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const emoji = this.getEmojiForType(event.type);
      
      itineraryContent += `${time ? `🕐 ${time} - ` : ''}${emoji} ${event.title}\n`;
      
      if (event.location?.address) {
        itineraryContent += `📍 ${event.location.address}\n`;
      }
      
      if (event.confirmationNumber) {
        itineraryContent += `🔗 Confirmation: ${event.confirmationNumber}\n`;
      }
      
      itineraryContent += `\n`;
    }

    itineraryContent += `Total bookings: ${events.length}\nSafe travels! 🌟`;

    await this.postmarkClient.sendEmail({
      From: process.env.FROM_EMAIL || 'noreply@travelbuilder.com',
      To: userEmail,
      Subject: '🗓️ Your Complete Itinerary',
      TextBody: itineraryContent,
    });
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