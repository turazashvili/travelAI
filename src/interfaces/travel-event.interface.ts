import { Document } from 'mongoose';

export interface Location {
  address?: string;
  city?: string;
  country?: string;
  airport?: string;
  coordinates?: [number, number];
}

export interface TravelEvent extends Document {
  tripId: string;
  type: string; // flexible: 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other' | any custom type
  title: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: Location;
  confirmationNumber?: string;
  provider?: string;
  rawEmailData: string;
  parsedData: Record<string, any>;
  confidence: number;
  createdAt: Date;
}