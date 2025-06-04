# Travel Itinerary Builder MVP

An email-first service that automatically compiles trip plans from confirmation emails using Postmark and MongoDB.

## Features

- **Email-First Interface**: No frontend UI needed - everything works via email
- **Flexible Email Parsing**: Supports flights, hotels, restaurants, activities, and any custom booking types
- **Automatic Trip Organization**: Smart grouping and timeline generation
- **MongoDB Storage**: Flexible schema for dynamic event types

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance
- Postmark account
- Domain for email processing

### Setup

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the application:**
   ```bash
   pnpm run start:dev
   ```

## Usage

### Creating a New Trip

Send an email to your support address with subject "NEW TRIP":
```
To: support@yourdomain.com
Subject: NEW TRIP

Hi, I'd like to create a new trip!
```

You'll receive a unique forwarding address like `trip-abc123@yourdomain.com`.

### Adding Bookings

Forward any booking confirmation emails to your trip address:
- ✈️ Flight confirmations
- 🏨 Hotel reservations  
- 🚗 Car rental bookings
- 🍽️ Restaurant reservations
- 🎫 Activity bookings
- 📋 Any other travel-related emails

### Getting Your Itinerary

Email your trip address with subject "GET ITINERARY":
```
To: trip-abc123@yourdomain.com
Subject: GET ITINERARY
```

You'll receive a formatted timeline with all your bookings.

## API Endpoints

### Webhook Endpoint
- `POST /email/inbound` - Processes inbound emails from Postmark

### Health Check
- `GET /email/health` - Service health status

### Trip Information
- `GET /email/trips/:forwardingAddress` - Get trip details and events

## Email Parsing

The system uses a three-tier parsing strategy:

1. **Template Matching**: Recognizes common booking confirmation formats
2. **Heuristic Extraction**: Uses patterns to extract dates, locations, confirmations
3. **Flexible Fallback**: Saves unknown formats as 'other' type with extracted text

### Supported Booking Types

- `flight` - Airlines, airports, flight numbers
- `hotel` - Hotels, check-in/out dates, room details
- `car` - Car rentals, pickup/return locations
- `restaurant` - Restaurant reservations, party size
- `activity` - Tours, tickets, experiences
- `other` - Any other travel-related bookings

New types are automatically created when the parser encounters unknown patterns.

## Configuration

### Environment Variables

```bash
# Required
POSTMARK_API_TOKEN=your_server_token
MONGODB_URI=mongodb://localhost:27017/travel-itinerary-builder

# Optional
OPENAI_API_TOKEN=your_openai_key  # For enhanced parsing
GOOGLE_MAPS_API_TOKEN=your_maps_key  # For location services
FROM_EMAIL=noreply@yourdomain.com
EMAIL_DOMAIN=yourdomain.com
PORT=3000
```

### Postmark Setup

1. Create a Postmark server
2. Configure inbound webhook to point to `https://yourdomain.com/email/inbound`
3. Set up your domain for email processing
4. Add your server token to `.env`

## Project Structure

```
src/
├── email/                 # Email processing module
│   ├── email.controller.ts    # Webhook endpoint & routing
│   ├── email.service.ts       # Email sending & user management
│   ├── parsing.service.ts     # Email content parsing
│   └── itinerary.service.ts   # Trip & event management
├── models/                # MongoDB schemas
│   ├── user.model.ts          # User data
│   ├── trip.model.ts          # Trip information
│   └── travel-event.model.ts  # Individual bookings
├── interfaces/            # TypeScript interfaces
└── main.ts               # Application entry point
```

## Development

### Available Scripts

```bash
pnpm run start:dev    # Development server with hot reload
pnpm run build        # Build for production
pnpm run start:prod   # Run production build
pnpm run test         # Run tests
```

### Adding New Parsing Rules

To support new booking formats, extend the `ParsingService`:

1. Add detection logic in `parseByTemplates()`
2. Create specific parsing method (e.g., `parseTrainEmail()`)
3. Add type-specific extraction helpers
4. Update confidence scoring

### Testing Email Processing

Use Postmark's webhook testing or send real emails to test the parsing pipeline.

## Production Deployment

1. **Set up production MongoDB**
2. **Configure production Postmark server**
3. **Deploy to cloud provider** (AWS, Heroku, etc.)
4. **Set up domain and DNS** for email processing
5. **Configure environment variables**
6. **Set up monitoring** and error tracking

## Limitations

- MVP version has no web UI
- No user authentication (email-based identity)
- Basic parsing rules (can be enhanced with ML)
- No real-time integrations
- No collaboration features yet

## Next Steps

See `PRD.md` for the complete roadmap including web dashboard, collaboration features, and advanced integrations.