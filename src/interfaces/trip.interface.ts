import { Document } from 'mongoose';
import { TravelEvent } from './travel-event.interface';

export interface Trip extends Document {
  userId: string;
  forwardingAddress: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  destination?: string;
  events: TravelEvent[];
  isActive: boolean;
  createdAt: Date;
}