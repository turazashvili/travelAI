# Travel Itinerary Builder 🤖✈️

An AI-powered email-first service that transforms scattered travel booking confirmations into beautiful, comprehensive trip plans with intelligent recommendations. Built for the [Postmark Challenge: Inbox Innovators](https://dev.to/challenges/postmark).

## 🌟 Features

- 📧 **Email-First Interface**: No apps, no accounts - everything works through email forwarding
- 🤖 **AI-Powered Parsing**: Automatically extracts details from any booking confirmation format using OpenAI
- 🗓️ **Smart Organization**: Chronological timeline with all trip events beautifully formatted
- 🌍 **AI Travel Recommendations**: Local restaurants, attractions, daily plans with clickable Google Maps links
- 📱 **Beautiful HTML Emails**: Mobile-responsive templates that work across all email clients
- 🔗 **Structured Output**: Guaranteed valid responses using OpenAI function calling
- 🏨 **Universal Compatibility**: Works with any email client, any booking provider
- 💾 **Flexible MongoDB Storage**: Dynamic schema handles any booking type automatically

## 🎬 Demo

**🔗 Watch the Demo:** [YouTube Video](https://www.youtube.com/watch?v=m9ljQ61GXvc&ab_channel=NikolozTurazashvili)

### Example AI-Enhanced Itinerary Output:
- ✅ **Trip Timeline**: Organized chronological view of all bookings
- 🍽️ **Restaurant Recommendations**: 4-5 local spots with ratings, Google Maps links, and special dishes
- 🏛️ **Sightseeing Suggestions**: Top attractions with entrance fees and best visit times
- 🎯 **Daily Activity Plans**: Structured itineraries with specific times and estimated costs
- 🗺️ **Navigation Help**: Directions from your hotel to popular destinations
- 🌤️ **Weather & Packing**: Seasonal advice and detailed packing lists
- 🎭 **Cultural Insights**: Local etiquette and practical travel tips

**Note:** Due to Postmark's pending approval restrictions, external email testing is limited. Please check the demo video for full functionality demonstration.

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance
- Postmark account
- Domain for email processing

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/turazashvili/travelAI.git
   cd travel-itinerary-builder
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

## 🚀 Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: MongoDB for flexible trip and event storage  
- **Email Service**: Postmark for both inbound and outbound email processing
- **AI Processing**: OpenAI GPT-4o-mini with function calling for structured responses
- **Package Manager**: pnpm for fast dependency management
- **Deployment**: Sevalla with automatic deployments

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

You'll receive a beautiful AI-enhanced itinerary with:
- Complete trip timeline with all bookings
- Local restaurant recommendations with Google Maps links
- Sightseeing suggestions with entrance fees
- Daily activity plans with specific times
- Navigation directions from your hotel
- Weather information and packing lists
- Cultural etiquette tips

## API Endpoints

### Webhook Endpoint
- `POST /email/inbound` - Processes inbound emails from Postmark

### Health Check
- `GET /email/health` - Service health status

### Trip Information
- `GET /email/trips/:forwardingAddress` - Get trip details and events

## 🤖 AI-Powered Features

### Email Parsing Strategy

The system uses an intelligent three-tier parsing approach:

1. **OpenAI Function Calling**: Structured JSON responses for AI recommendations
2. **Template Matching**: Recognizes common booking confirmation formats  
3. **Heuristic Extraction**: Uses patterns to extract dates, locations, confirmations
4. **Flexible Fallback**: Saves unknown formats as 'other' type with extracted text

### AI Enhancement Pipeline

```typescript
// OpenAI Function Calling for guaranteed JSON structure
const completion = await this.openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  functions: [{
    name: "generate_suggestions",
    description: "Generate comprehensive travel destination recommendations",
    parameters: {
      type: "object",
      properties: {
        restaurants: { /* detailed schema */ },
        sightseeing: { /* detailed schema */ },
        activities: { /* detailed schema */ },
        // ... more structured properties
      }
    }
  }],
  function_call: { name: "generate_suggestions" }
});
```

### Supported Booking Types

- `flight` - Airlines, airports, flight numbers
- `hotel` - Hotels, check-in/out dates, room details
- `car` - Car rentals, pickup/return locations
- `restaurant` - Restaurant reservations, party size
- `activity` - Tours, tickets, experiences
- `other` - Any other travel-related bookings

New types are automatically created when the parser encounters unknown patterns.

## 📋 Configuration

### Environment Variables

```bash
# Required
POSTMARK_API_TOKEN=your_server_token
MONGODB_URI=mongodb://localhost:27017/travel-itinerary-builder

# Required for AI Features  
OPENAI_API_TOKEN=your_openai_key  # For AI parsing and recommendations
GOOGLE_MAPS_API_TOKEN=your_maps_key  # For location services and links

# Email Configuration
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
│   ├── email.controller.ts       # Webhook endpoint & routing
│   ├── email.service.ts          # Email sending & user management
│   ├── parsing.service.ts        # Email content parsing
│   ├── destination-ai.service.ts # AI recommendations with function calling
│   ├── email-template.service.ts # Beautiful HTML email generation
│   └── itinerary.service.ts      # Trip & event management
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

## 🏆 Why This Project Stands Out

1. **Zero Friction UX**: No downloads, signups, or new interfaces to learn
2. **AI Enhancement**: Goes beyond organization to provide valuable travel insights  
3. **Universal Compatibility**: Works with any email client, any booking provider
4. **Practical Value**: Solves a real problem every traveler faces
5. **Scalable Architecture**: Built to handle various booking formats and destinations
6. **Email Reimagined**: Showcases email as a powerful interface for AI-powered services

## 🚀 Future Enhancements

- Real-time flight status updates
- Weather integration for packing suggestions  
- Collaborative trip planning for groups
- Calendar integration (iCal export)
- Expense tracking and budget insights

## 📄 Additional Documentation

- `PRD.md` - Complete product requirements and roadmap
- `MVP.md` - MVP specification and implementation details
- `demo.md` - Video demo script and preparation guide
- `submission.md` - Postmark Challenge submission

---

*Built with ❤️ for the [Postmark Challenge: Inbox Innovators](https://dev.to/challenges/postmark) using Postmark's excellent email infrastructure*