This is a submission for the [Postmark Challenge: Inbox Innovators](https://dev.to/challenges/postmark).

## What I Built 

I built **Travel Itinerary Builder** - an AI-powered service that transforms scattered travel booking confirmations into organized, comprehensive trip plans through simple email forwarding. No apps, no accounts, just email.

**The Problem:** Travelers receive confirmation emails from various sources (airlines, hotels, car rentals, restaurants) creating a mess of scattered information that's time-consuming to organize manually.

**The Solution:** Forward booking confirmations to a unique trip email address and receive back beautiful, AI-enhanced itineraries with:
- 📧 **Email-First Interface**: Everything works through email forwarding
- 🤖 **AI-Powered Parsing**: Automatically extracts details from any booking format
- 🗓️ **Smart Organization**: Chronological timeline with all trip events
- 🌟 **AI Recommendations**: Local restaurants, attractions, and daily plans with clickable Google Maps links
- 📱 **Mobile-Friendly**: Beautiful HTML emails that work on any device
- 🔗 **Structured Output**: Guaranteed valid responses using OpenAI function calling

**Key Features:**
- Create trips with "NEW TRIP" email subject
- Forward any booking confirmation to your unique trip address  
- Get comprehensive itineraries with "GET ITINERARY" request
- AI generates restaurant recommendations, sightseeing suggestions, daily plans, navigation, local tips, weather info, and cultural etiquette
- All responses include clickable links and practical information

## Demo 

🔗 **Demo:** [Youtube Video](https://www.youtube.com/watch?v=m9ljQ61GXvc&ab_channel=NikolozTurazashvili)
{% embed https://www.youtube.com/watch?v=m9ljQ61GXvc&ab_channel=NikolozTurazashvili %}

**Testing Instructions:**

To test the application, send an email to: **support@nikolabs.ge**

1. **Create a New Trip:**
   ```
   To: support@nikolabs.ge
   Subject: NEW TRIP
   ```
   You'll receive a unique trip address like `trip-abc123@nikolabs.ge`

2. **Add Bookings:** Send any booking confirmations to your trip address
3. **Get Itinerary:** Email your trip address with subject "GET ITINERARY"

**Note:** Due to Postmark's pending approval restrictions, responses are currently limited to emails within the nikolabs.ge domain. For external domains, please check the video demonstration and GitHub repository for a complete overview of the functionality.


**Screenshots:**

### Welcome Email

![Welcome Email](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ai7e5szwaaim7nl3lwdy.png)
*Clean welcome email with unique trip address and instructions*

### Booking Confirmation  

![Confirmation email](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/36atwvhr8k4qs3pwyssp.png)
*Instant confirmation when bookings are added to your trip*

### AI-Enhanced Itinerary

![AI-Enhanced Itinerary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0kk5oby99n82s1vecwz2.png)

![AI-Enhanced Itinerary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ik2h0iwxq6dckqt209w7.png)

![AI-Enhanced Itinerary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0cqbqf3cayjf8u14q7ib.png)

![AI-Enhanced Itinerary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w8ejja9gekp52pzjrtzt.png)

![AI-Enhanced Itinerary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/i36vpodbg2y10m6kv5jc.png)
*Beautiful HTML itinerary with timeline, AI recommendations, and clickable links*

### Mobile-Responsive Design

![AI-Enhanced Itinerary Mobile](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4g0qpxa3cti02ucbt4tw.png)
*Perfectly formatted for mobile email clients*

## Code Repository

🔗 **GitHub Repository:** [https://github.com/turazashvili/travelAI](https://github.com/turazashvili/travelAI)

The repository includes:
- Complete NestJS TypeScript backend
- AI parsing with OpenAI function calling
- Postmark integration for inbound/outbound emails
- MongoDB data models for flexible trip storage
- Beautiful HTML email templates
- Comprehensive demo script and documentation

## How I Built It 

### Tech Stack
- **Backend:** NestJS with TypeScript
- **Database:** MongoDB for flexible trip and event storage
- **Email Service:** Postmark for both inbound and outbound email processing
- **AI Processing:** OpenAI GPT-4o-mini with function calling for structured responses
- **Deployment:** Sevalla with automatic deployments
- **Package Manager:** pnpm for fast dependency management

### Implementation Process

#### 1. Email-First Architecture
I designed the system around email as the primary interface because:
- No app downloads or account creation needed
- Works on any device with email
- Familiar interface for all users
- Perfect for travel when you need quick access

#### 2. Postmark Integration
Postmark was crucial for both directions:

**Inbound Processing:**
```typescript
// Webhook endpoint for processing forwarded emails
@Post('inbound')
async handleInboundEmail(@Body() emailData: PostmarkInboundEmail) {
  // Route emails based on subject and destination
  if (subject.toUpperCase().includes('NEW TRIP')) {
    await this.handleNewTripRequest(fromEmail);
  } else if (subject.toUpperCase().includes('GET ITINERARY')) {
    await this.handleItineraryRequest(fromEmail, toEmail);
  } else {
    await this.handleBookingEmail(fromEmail, toEmail, subject, textBody);
  }
}
```

**Outbound Email Generation:**
```typescript
await this.postmarkClient.sendEmail({
  From: process.env.FROM_EMAIL,
  To: userEmail,
  Subject: '🗓️ Your AI-Enhanced Travel Itinerary',
  HtmlBody: htmlContent,
  TextBody: textContent,
});
```

#### 3. AI-Powered Enhancement
The real innovation came with AI integration:

**Smart Parsing:** Any booking confirmation format gets parsed using OpenAI
**Structured Output:** Using function calling to guarantee valid JSON responses
**Rich Recommendations:** AI generates comprehensive travel suggestions with real links

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

#### 4. MongoDB Flexibility
Used MongoDB for its flexible schema to handle any booking type:
```typescript
interface TravelEvent {
  type: string; // 'flight' | 'hotel' | 'car' | 'restaurant' | 'activity' | any custom type
  title: string;
  startDateTime?: Date;
  location?: LocationData;
  parsedData: Record<string, any>; // flexible for any extracted data
  confidence: number; // AI parsing confidence
}
```

#### 5. Beautiful Email Templates
Created responsive HTML email templates that work across all email clients:
- Horizontal stats layout for trip overview
- Clean timeline with emojis and formatting
- Clickable Google Maps links for all suggestions
- Mobile-responsive design
- Fallback text versions

### Experience with Postmark

Postmark exceeded expectations in several ways:

**Reliability:** 100% email delivery during development and testing
**Speed:** Sub-second processing for both inbound and outbound emails  
**Developer Experience:** Clean API, excellent documentation, helpful error messages
**Webhook Processing:** Rock-solid inbound email parsing with rich metadata
**Template Support:** Great HTML email rendering across email clients

**Challenges Overcome:**
- Initially tried custom email headers for threading, learned to work within Postmark's constraints
- Optimized email parsing for various booking confirmation formats
- Handled rate limiting gracefully for AI processing

**Key Postmark Features Used:**
- Inbound email processing with webhooks
- Outbound email API with HTML/text content
- Message streams for organization
- Delivery tracking and error handling

### Why This Project Stands Out

1. **Zero Friction UX:** No downloads, signups, or new interfaces to learn
2. **AI Enhancement:** Goes beyond organization to provide valuable travel insights
3. **Universal Compatibility:** Works with any email client, any booking provider
4. **Practical Value:** Solves a real problem every traveler faces
5. **Scalable Architecture:** Built to handle various booking formats and destinations

### Future Enhancements
- Real-time flight status updates
- Weather integration for packing suggestions  
- Collaborative trip planning for groups
- Calendar integration (iCal export)
- Expense tracking and budget insights

This project showcases how email can be reimagined as a powerful interface for AI-powered services, with Postmark providing the reliable infrastructure to make it all possible.

---

*Built with ❤️ using Postmark's excellent email infrastructure*