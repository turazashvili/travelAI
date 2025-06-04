# Travel Itinerary Builder - MVP Specification

## MVP Constraints & Focus

### Core Principle: Email-First Solution
- **No Frontend UI**: All interactions happen via email
- **Email-in, Email-out**: Users interact entirely through email forwarding and receive formatted itineraries via email
- **Simple Onboarding**: Start with "NEW TRIP" subject line

## 1. MVP User Flow

### Getting Started
1. User emails support address with subject "NEW TRIP"
2. System generates unique trip forwarding address (e.g., `trip-abc123@travelbuilder.com`)
3. User receives email with forwarding address and instructions

### Adding Bookings
1. User forwards booking confirmations to their unique trip address
2. System parses email and adds to trip
3. User receives confirmation email with parsed details

### Viewing Itinerary
1. User emails trip address with subject "GET ITINERARY"
2. System sends formatted email with complete trip timeline
3. Includes all bookings in chronological order

### Managing Trips
- **Multiple trips**: Email with "NEW TRIP" creates additional trip addresses
- **Trip completion**: Emails stop being processed after trip end date + 7 days

## 2. Technical Architecture (MVP)

### 2.1 Core Stack
- **Backend**: NestJS with TypeScript
- **Database**: MongoDB (flexible schema for dynamic event types)
- **Email Processing**: Postmark Inbound
- **Email Sending**: Postmark Outbound
- **Hosting**: Simple VPS or cloud instance

### 2.2 Data Models

#### User
```typescript
interface User {
  _id: ObjectId;
  email: string;
  createdAt: Date;
  trips: ObjectId[];
}
```

#### Trip
```typescript
interface Trip {
  _id: ObjectId;
  userId: ObjectId;
  forwardingAddress: string; // unique email for this trip
  title?: string; // auto-generated or extracted
  startDate?: Date; // auto-detected from first booking
  endDate?: Date; // auto-detected from last booking
  destination?: string; // auto-detected from locations
  events: TravelEvent[];
  isActive: boolean; // false after trip ends + grace period
  createdAt: Date;
}
```

#### TravelEvent (Flexible Schema)
```typescript
interface TravelEvent {
  _id: ObjectId;
  tripId: ObjectId;
  type: string; // 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | 'other' | any custom type
  title: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: {
    address?: string;
    city?: string;
    country?: string;
    airport?: string;
    coordinates?: [number, number];
  };
  confirmationNumber?: string;
  provider?: string; // airline, hotel chain, etc.
  rawEmailData: string; // full email content for debugging
  parsedData: Record<string, any>; // flexible object for any extracted data
  confidence: number; // parsing confidence score 0-1
  createdAt: Date;
}
```

### 2.3 Email Processing Pipeline

```
Inbound Email → Postmark → Webhook → NestJS API → Email Router → Parser → MongoDB → Response Email
```

#### Email Router Logic
1. **NEW TRIP**: Create new trip, generate forwarding address, send welcome email
2. **GET ITINERARY**: Query trip events, format timeline, send itinerary email
3. **Booking Confirmation**: Parse content, extract events, save to trip, send confirmation

## 3. Email Parsing Strategy

### 3.1 Dynamic Type Detection
Since MongoDB allows flexible schemas, we can:
- Start with common types: `flight`, `hotel`, `car`, `restaurant`, `activity`
- Automatically create new types when patterns don't match existing ones
- Store all extracted data in `parsedData` object regardless of type
- Use confidence scoring to improve parsing over time

### 3.2 Parsing Approach
```typescript
interface ParseResult {
  type: string; // detected or 'other'
  confidence: number;
  extractedData: {
    title: string;
    startDateTime?: Date;
    endDateTime?: Date;
    location?: LocationData;
    confirmationNumber?: string;
    provider?: string;
    passengers?: string[];
    cost?: string;
    [key: string]: any; // flexible for unknown data
  };
}
```

### 3.3 Parser Priority
1. **Known Templates**: Regex patterns for major providers
2. **Heuristic Extraction**: Look for common patterns (dates, times, confirmation numbers)
3. **Fallback**: Save as 'other' type with basic text extraction
4. **Learning**: Track successful vs failed parses for improvement

## 4. Email Templates

### 4.1 Welcome Email (NEW TRIP response)
```
Subject: Your Trip Address is Ready! 📧

Hi there!

Your new trip address is: trip-abc123@travelbuilder.com

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
```

### 4.2 Booking Confirmation Email
```
Subject: ✅ Added to your trip: [Booking Title]

Great! I've added this to your trip:

📅 [Date/Time]
📍 [Location]
🎫 [Type]: [Title]
🔗 Confirmation: [Number]

Your trip now has [X] bookings.
Email with "GET ITINERARY" to see the full timeline.
```

### 4.3 Itinerary Email
```
Subject: 🗓️ Your Complete Itinerary

Here's your trip timeline:

📍 DESTINATION: [Primary Location]
📅 DATES: [Start Date] - [End Date]

TIMELINE:
─────────

[Day 1 - Date]
🕐 [Time] - ✈️ [Flight Details]
🕐 [Time] - 🏨 [Hotel Check-in]

[Day 2 - Date]
🕐 [Time] - 🍽️ [Restaurant Reservation]
🕐 [Time] - 🎫 [Activity]

...

Total bookings: [X]
Safe travels! 🌟
```

## 5. MVP Implementation Plan (4 weeks)

### Week 1: Core Infrastructure
- NestJS project setup with MongoDB
- Postmark integration (inbound/outbound)
- Basic email routing (NEW TRIP, GET ITINERARY)
- User and Trip models

### Week 2: Email Parsing Engine
- Common email pattern recognition (airlines, hotels)
- Flexible TravelEvent creation with dynamic typing
- Confidence scoring system
- Basic heuristic extraction (dates, times, confirmations)

### Week 3: Itinerary Generation
- Event sorting and timeline creation
- Email template system
- Trip auto-completion logic
- Error handling and fallbacks

### Week 4: Testing & Polish
- Integration testing with real emails
- Error handling improvements
- Performance optimization
- Documentation and deployment

## 6. Success Metrics (MVP)

### Parsing Accuracy
- **Target**: 80% successful parsing for major providers
- **Measurement**: Manual review of first 100 processed emails

### User Engagement
- **Target**: 70% of users who create a trip add at least 2 bookings
- **Measurement**: Trip completion rate

### System Reliability
- **Target**: 99% uptime, <30 second email processing
- **Measurement**: System monitoring

## 7. MVP Limitations & Future Features

### What's NOT in MVP
- Web UI dashboard
- User accounts/authentication
- Payment/subscription system
- Collaboration features
- Mobile app
- Real-time integrations
- Advanced AI/ML parsing

### Natural Evolution Path
1. **Week 5-8**: Add basic web dashboard for viewing (optional)
2. **Week 9-12**: User authentication and trip management
3. **Week 13-16**: Collaboration features
4. **Week 17-20**: Advanced parsing and integrations

## 8. Technical Considerations

### 8.1 Email Address Management
```typescript
// Unique address generation
const generateTripAddress = () => {
  const id = nanoid(8); // short, URL-safe ID
  return `trip-${id}@travelbuilder.com`;
};
```

### 8.2 Email Processing Queue
- Use Bull Queue for reliable email processing
- Retry failed parsing attempts
- Dead letter queue for manual review

### 8.3 Data Flexibility
```typescript
// Example of flexible event storage
const flightEvent = {
  type: 'flight',
  title: 'Flight to Paris',
  parsedData: {
    airline: 'Air France',
    flightNumber: 'AF123',
    departure: { airport: 'JFK', time: '...' },
    arrival: { airport: 'CDG', time: '...' },
    passengers: ['John Doe'],
    seat: '12A'
  }
};

const unknownEvent = {
  type: 'other',
  title: 'Travel Insurance Confirmation',
  parsedData: {
    provider: 'TravelGuard',
    policyNumber: 'TG123456',
    coverage: '$50,000',
    // Any other extracted fields
  }
};
```

## 9. Deployment Strategy

### 9.1 Infrastructure
- **Server**: VPS with Docker deployment
- **Database**: MongoDB Atlas (free tier for MVP)
- **Email**: Postmark (generous free tier)
- **Domain**: Custom domain for email processing

### 9.2 Monitoring
- Basic logging with Winston
- Email processing success/failure tracking
- Simple health check endpoint

This MVP focuses on proving the core concept with minimal complexity while maintaining flexibility for future expansion.