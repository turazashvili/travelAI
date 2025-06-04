import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip } from '../models/trip.model';
import { TravelEvent } from '../models/travel-event.model';

@Injectable()
export class ItineraryService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<Trip>,
    @InjectModel(TravelEvent.name) private travelEventModel: Model<TravelEvent>,
  ) {}

  async addEventToTrip(tripId: string, eventData: any): Promise<TravelEvent> {
    const event = new this.travelEventModel({
      tripId,
      ...eventData,
    });

    await event.save();

    // Update trip with event reference
    await this.tripModel.findByIdAndUpdate(
      tripId,
      { $push: { events: event._id } },
    );

    // Update trip metadata
    await this.updateTripMetadata(tripId);

    return event;
  }

  async getTripEvents(tripId: string): Promise<TravelEvent[]> {
    return this.travelEventModel.find({ tripId }).sort({ startDateTime: 1, createdAt: 1 });
  }

  async updateTripMetadata(tripId: string): Promise<void> {
    const events = await this.getTripEvents(tripId);
    
    if (events.length === 0) return;

    const updateData: any = {};

    // Auto-detect trip dates
    const datesWithTimes = events
      .filter(e => e.startDateTime)
      .map(e => e.startDateTime)
      .sort((a, b) => a.getTime() - b.getTime());

    if (datesWithTimes.length > 0) {
      updateData.startDate = datesWithTimes[0];
      updateData.endDate = datesWithTimes[datesWithTimes.length - 1];
    }

    // Auto-detect destination
    const locations = events
      .map(e => e.location?.city || e.location?.address)
      .filter(Boolean);

    if (locations.length > 0) {
      const destinationCounts = {};
      locations.forEach(loc => {
        destinationCounts[loc] = (destinationCounts[loc] || 0) + 1;
      });
      
      const mostCommonDestination = Object.entries(destinationCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
      
      updateData.destination = mostCommonDestination;
    }

    // Auto-generate trip title
    if (!updateData.title && updateData.destination) {
      const startDateStr = updateData.startDate ? 
        ` - ${updateData.startDate.toLocaleDateString()}` : '';
      updateData.title = `Trip to ${updateData.destination}${startDateStr}`;
    }

    await this.tripModel.findByIdAndUpdate(tripId, updateData);
  }

  async deactivateExpiredTrips(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await this.tripModel.updateMany(
      {
        isActive: true,
        endDate: { $lt: sevenDaysAgo }
      },
      { isActive: false }
    );
  }
}