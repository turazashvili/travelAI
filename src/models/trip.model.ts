import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trip extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  forwardingAddress: string;

  @Prop()
  title?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  destination?: string;

  @Prop({ type: [String], default: [] })
  events: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TripSchema = SchemaFactory.createForClass(Trip);