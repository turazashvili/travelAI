import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class Location {
  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop()
  airport?: string;

  @Prop({ type: [Number] })
  coordinates?: [number, number];
}

@Schema({ timestamps: true })
export class TravelEvent extends Document {
  @Prop({ required: true })
  tripId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  startDateTime?: Date;

  @Prop()
  endDateTime?: Date;

  @Prop({ type: Location })
  location?: Location;

  @Prop()
  confirmationNumber?: string;

  @Prop()
  provider?: string;

  @Prop({ required: true })
  rawEmailData: string;

  @Prop({ type: Object, default: {} })
  parsedData: Record<string, any>;

  @Prop({ min: 0, max: 1, default: 0.5 })
  confidence: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const TravelEventSchema = SchemaFactory.createForClass(TravelEvent);