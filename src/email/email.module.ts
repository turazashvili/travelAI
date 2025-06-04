import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ParsingService } from './parsing.service';
import { AIParsingService } from './ai-parsing.service';
import { DestinationAIService } from './destination-ai.service';
import { EmailTemplateService } from './email-template.service';
import { ItineraryService } from './itinerary.service';
import { User, UserSchema } from '../models/user.model';
import { Trip, TripSchema } from '../models/trip.model';
import { TravelEvent, TravelEventSchema } from '../models/travel-event.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Trip.name, schema: TripSchema },
      { name: TravelEvent.name, schema: TravelEventSchema },
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService, ParsingService, AIParsingService, DestinationAIService, EmailTemplateService, ItineraryService],
})
export class EmailModule {}