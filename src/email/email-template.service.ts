import { Injectable } from '@nestjs/common';
import { TravelEvent } from '../models/travel-event.model';
import { Trip } from '../models/trip.model';
import { DestinationSuggestions } from './destination-ai.service';

@Injectable()
export class EmailTemplateService {

  generateWelcomeEmailHTML(forwardingAddress: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Trip Address is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">✈️ Your Trip Address is Ready!</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Let's plan your perfect journey</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                                <h2 style="color: #334155; margin: 0 0 10px 0; font-size: 18px;">Your unique trip email:</h2>
                                <p style="font-family: 'Courier New', monospace; background-color: white; padding: 12px; border-radius: 6px; margin: 0; font-size: 16px; color: #1e293b; border: 2px dashed #667eea;">${forwardingAddress}</p>
                            </div>
                            
                            <h3 style="color: #334155; margin: 0 0 20px 0; font-size: 20px;">📧 How it works:</h3>
                            
                            <div style="margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <div style="background-color: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</div>
                                    <p style="margin: 0; color: #475569; font-size: 16px;"><strong>Forward your booking confirmations</strong> to this address</p>
                                </div>
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <div style="background-color: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</div>
                                    <p style="margin: 0; color: #475569; font-size: 16px;"><strong>We'll automatically parse</strong> and organize your trip</p>
                                </div>
                                <div style="display: flex; align-items: center;">
                                    <div style="background-color: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</div>
                                    <p style="margin: 0; color: #475569; font-size: 16px;"><strong>Get your complete itinerary</strong> with AI-powered suggestions</p>
                                </div>
                            </div>
                            
                            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
                                <h4 style="color: #047857; margin: 0 0 15px 0; font-size: 16px;">📋 Supported bookings:</h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                                    <span style="color: #065f46;">✈️ Flights</span>
                                    <span style="color: #065f46;">🏨 Hotels</span>
                                    <span style="color: #065f46;">🚗 Car rentals</span>
                                    <span style="color: #065f46;">🍽️ Restaurants</span>
                                    <span style="color: #065f46;">🎫 Activities</span>
                                    <span style="color: #065f46;">📋 Any bookings</span>
                                </div>
                            </div>
                            
                            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; text-align: center; margin-top: 30px;">
                                <p style="margin: 0; color: #92400e; font-size: 16px;"><strong>💡 Pro tip:</strong> Email with subject "GET ITINERARY" to receive your complete travel plan with personalized suggestions!</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #64748b; font-size: 14px;">Happy travels! 🌟</p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">Travel Itinerary Builder - Your AI-powered travel companion</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  generateBookingConfirmationHTML(eventTitle: string, eventType: string): string {
    const emoji = this.getEmojiForType(eventType);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Added to Your Trip</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">✅ Booking Added!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <div style="text-align: center; margin-bottom: 25px;">
                                <div style="background-color: #f0fdf4; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px;">${emoji}</div>
                                <h2 style="color: #1f2937; margin: 0; font-size: 20px; line-height: 1.4;">${eventTitle}</h2>
                            </div>
                            
                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
                                <p style="margin: 0; color: #374151; font-size: 16px;">Your trip is being automatically organized.</p>
                                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">Email with subject <strong>"GET ITINERARY"</strong> to see your complete timeline with AI-powered suggestions!</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">Travel Itinerary Builder</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  generateItineraryEmailHTML(
    trip: Trip, 
    events: TravelEvent[], 
    suggestions?: DestinationSuggestions,
    insights?: string
  ): string {
    const sortedEvents = events.sort((a, b) => 
      (a.startDateTime || a.createdAt).getTime() - (b.startDateTime || b.createdAt).getTime()
    );

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Complete Itinerary</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px;">
                <table role="presentation" style="max-width: 700px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">🗓️ Your Complete Itinerary</h1>
                            ${trip.destination ? `<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">📍 ${trip.destination}</p>` : ''}
                            ${trip.startDate && trip.endDate ? `<p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">${trip.startDate.toDateString()} - ${trip.endDate.toDateString()}</p>` : ''}
                        </td>
                    </tr>
                    
                    <!-- Trip Overview -->
                    ${this.generateTripOverviewSection(trip, events)}
                    
                    <!-- Timeline -->
                    ${this.generateTimelineSection(sortedEvents)}
                    
                    <!-- AI Insights -->
                    ${insights ? this.generateInsightsSection(insights) : ''}
                    
                    <!-- Suggestions -->
                    ${suggestions ? this.generateSuggestionsSection(suggestions) : ''}
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #64748b; font-size: 16px;">Safe travels! 🌟</p>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">AI-powered by Travel Itinerary Builder</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  private generateTripOverviewSection(trip: Trip, events: TravelEvent[]): string {
    const stats = this.calculateTripStats(events);
    
    return `
    <tr>
        <td style="padding: 30px;">
            <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                <tr>
                    <td style="width: 25%; text-align: center; padding: 15px;">
                        <div style="background-color: #dbeafe; border-radius: 8px; padding: 15px 10px;">
                            <div style="font-size: 20px; margin-bottom: 3px;">📅</div>
                            <div style="color: #1e40af; font-weight: 600; font-size: 16px;">${stats.totalDays}</div>
                            <div style="color: #3730a3; font-size: 11px;">Days</div>
                        </div>
                    </td>
                    <td style="width: 25%; text-align: center; padding: 15px;">
                        <div style="background-color: #dcfce7; border-radius: 8px; padding: 15px 10px;">
                            <div style="font-size: 20px; margin-bottom: 3px;">📋</div>
                            <div style="color: #15803d; font-weight: 600; font-size: 16px;">${events.length}</div>
                            <div style="color: #166534; font-size: 11px;">Bookings</div>
                        </div>
                    </td>
                    <td style="width: 25%; text-align: center; padding: 15px;">
                        <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px 10px;">
                            <div style="font-size: 20px; margin-bottom: 3px;">✈️</div>
                            <div style="color: #d97706; font-weight: 600; font-size: 16px;">${stats.flightCount}</div>
                            <div style="color: #92400e; font-size: 11px;">Flights</div>
                        </div>
                    </td>
                    <td style="width: 25%; text-align: center; padding: 15px;">
                        <div style="background-color: #fce7f3; border-radius: 8px; padding: 15px 10px;">
                            <div style="font-size: 20px; margin-bottom: 3px;">🏨</div>
                            <div style="color: #be185d; font-weight: 600; font-size: 16px;">${stats.hotelCount}</div>
                            <div style="color: #9d174d; font-size: 11px;">Hotels</div>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>`;
  }

  private generateTimelineSection(events: TravelEvent[]): string {
    let currentDate = '';
    let timelineHTML = `
    <tr>
        <td style="padding: 0 30px 30px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 25px 0; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">📅 Your Timeline</h2>`;

    for (const event of events) {
      const eventDate = event.startDateTime ? event.startDateTime.toDateString() : event.createdAt.toDateString();
      
      if (eventDate !== currentDate) {
        currentDate = eventDate;
        timelineHTML += `
            <div style="background-color: #f1f5f9; padding: 12px 20px; margin: 20px 0 10px 0; border-radius: 6px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0; color: #334155; font-size: 16px; font-weight: 600;">${eventDate}</h3>
            </div>`;
      }
      
      const time = event.startDateTime ? event.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const emoji = this.getEmojiForType(event.type);
      
      timelineHTML += `
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 10px 0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="background-color: #f8fafc; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">${emoji}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 8px;">
                            <h4 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${event.title}</h4>
                            ${time ? `<span style="color: #6b7280; font-size: 14px; font-weight: 500; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin-left: 10px;">${time}</span>` : ''}
                        </div>
                        ${event.location?.address ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">📍 ${event.location.address}</p>` : ''}
                        ${event.confirmationNumber ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">🔗 Confirmation: <span style="font-family: monospace; background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${event.confirmationNumber}</span></p>` : ''}
                        ${event.provider ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">🏢 ${event.provider}</p>` : ''}
                    </div>
                </div>
            </div>`;
    }
    
    timelineHTML += `
        </td>
    </tr>`;
    
    return timelineHTML;
  }

  private generateInsightsSection(insights: string): string {
    // Parse and format the insights from AI
    const formattedInsights = this.formatAIInsights(insights);
    
    return `
    <tr>
        <td style="padding: 0 30px 30px 30px;">
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 25px; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                    🧠 AI Travel Insights
                </h3>
                ${formattedInsights}
            </div>
        </td>
    </tr>`;
  }

  private formatAIInsights(insights: string): string {
    // Clean up the insights and convert to structured HTML
    const points = insights
      .split(/\d+\.\s*\*\*/)
      .filter(point => point.trim().length > 0)
      .map(point => {
        // Extract title and description
        const titleMatch = point.match(/^([^*]+)\*\*:\s*(.*)/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const description = titleMatch[2].trim();
          return { title, description };
        } else {
          // Fallback for different formatting
          const cleanPoint = point.replace(/\*\*/g, '').trim();
          return { title: 'Travel Tip', description: cleanPoint };
        }
      });

    let html = '';
    points.forEach((point, index) => {
      if (point.description) {
        html += `
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: ${index === points.length - 1 ? '0' : '18px'};">
            <div style="background-color: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">${index + 1}</div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 6px 0; color: #92400e; font-size: 16px; font-weight: 600;">${point.title}</h4>
              <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">${point.description}</p>
            </div>
          </div>`;
      }
    });

    return html || `<p style="color: #78350f; margin: 0; font-size: 16px; line-height: 1.6;">${insights}</p>`;
  }

  private generateSuggestionsSection(suggestions: DestinationSuggestions): string {
    return `
    <tr>
        <td style="padding: 0 30px 30px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 25px 0; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">🌟 AI-Powered Recommendations</h2>
            
            <!-- Daily Plans -->
            ${suggestions.dailyPlans ? this.generateDailyPlansSection(suggestions.dailyPlans) : ''}
            
            <!-- Navigation from Hotel -->
            ${suggestions.navigationFromHotel ? this.generateNavigationSection(suggestions.navigationFromHotel) : ''}
            
            <!-- Restaurants -->
            ${this.generateRestaurantSection(suggestions.restaurants)}
            
            <!-- Sightseeing -->
            ${this.generateSightseeingSection(suggestions.sightseeing)}
            
            <!-- Activities -->
            ${this.generateActivitiesSection(suggestions.activities)}
            
            <!-- Local Tips -->
            ${this.generateLocalTipsSection(suggestions.localTips)}
            
            <!-- Transportation -->
            ${this.generateTransportationSection(suggestions.transportation)}
            
            <!-- Cultural Etiquette -->
            ${suggestions.culturalEtiquette ? this.generateCulturalEtiquetteSection(suggestions.culturalEtiquette) : ''}
            
            <!-- Weather -->
            ${this.generateWeatherSection(suggestions.weather)}
        </td>
    </tr>`;
  }

  private generateDailyPlansSection(dailyPlans: any[]): string {
    let html = `
    <div style="margin-bottom: 40px;">
        <h3 style="color: #8b5cf6; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center; gap: 8px;">
            📅 Daily Travel Plans
        </h3>`;
    
    dailyPlans.slice(0, 5).forEach(plan => {
      html += `
        <div style="background-color: #f5f3ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">
            <h4 style="margin: 0 0 8px 0; color: #6d28d9; font-size: 18px;">Day ${plan.day}: ${plan.title}</h4>
            <p style="margin: 0 0 15px 0; color: #7c3aed; font-size: 14px; font-style: italic;">${plan.theme}</p>
            <div style="space-y: 10px;">`;
      
      plan.activities.forEach(activity => {
        html += `
                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 12px; background-color: white; border-radius: 8px;">
                    <div style="background-color: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; min-width: 60px; text-align: center;">${activity.time}</div>
                    <div style="flex: 1;">
                        <p style="margin: 0 0 4px 0; color: #4c1d95; font-weight: 600; font-size: 14px;">${activity.activity}</p>
                        <p style="margin: 0 0 4px 0; color: #6b46c1; font-size: 12px;">📍 ${activity.location}</p>
                        ${activity.notes ? `<p style="margin: 0 0 4px 0; color: #7c3aed; font-size: 12px;">💡 ${activity.notes}</p>` : ''}
                        ${activity.estimatedCost ? `<p style="margin: 0; color: #059669; font-size: 12px; font-weight: 500;">💰 ${activity.estimatedCost}</p>` : ''}
                    </div>
                </div>`;
      });
      
      html += `
            </div>
        </div>`;
    });
    
    html += `
    </div>`;
    
    return html;
  }

  private generateNavigationSection(navigation: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #f59e0b; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🧭 Navigation from Your Hotel
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">`;
    
    navigation.slice(0, 6).forEach(nav => {
      html += `
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; border-left: 4px solid #f59e0b;">
                <h4 style="margin: 0 0 8px 0; color: #d97706; font-size: 14px; font-weight: 600;">📍 ${nav.destination}</h4>
                <p style="margin: 0 0 5px 0; color: #92400e; font-size: 13px;"><strong>${nav.method}</strong> • ${nav.duration}</p>
                <p style="margin: 0 0 8px 0; color: #78350f; font-size: 12px; line-height: 1.4;">${nav.instructions}</p>
                <p style="margin: 0; color: #059669; font-size: 12px; font-weight: 500;">💰 ${nav.cost}</p>
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateCulturalEtiquetteSection(etiquette: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #ec4899; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🤝 Cultural Etiquette
        </h3>
        <div style="background-color: #fdf2f8; border-radius: 12px; padding: 20px; border-left: 4px solid #ec4899;">`;
    
    etiquette.forEach((item, index) => {
      html += `
            <div style="margin-bottom: ${index === etiquette.length - 1 ? '0' : '15px'};">
                <h4 style="margin: 0 0 5px 0; color: #be185d; font-size: 14px; font-weight: 600;">${item.category}</h4>
                <p style="margin: 0; color: #9d174d; font-size: 13px; line-height: 1.4;">${item.advice}</p>
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateRestaurantSection(restaurants: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🍽️ Recommended Restaurants
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">`;
    
    restaurants.slice(0, 4).forEach(restaurant => {
      html += `
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; border-left: 4px solid #dc2626;">
                <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 16px;">${restaurant.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <p style="margin: 0; color: #7f1d1d; font-size: 12px; font-weight: 500;">${restaurant.cuisine} • ${restaurant.priceRange}</p>
                    ${restaurant.rating ? `<span style="background-color: #059669; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">⭐ ${restaurant.rating}</span>` : ''}
                </div>
                <p style="margin: 0 0 10px 0; color: #7c2d12; font-size: 14px; line-height: 1.4;">${restaurant.description}</p>
                ${restaurant.specialDishes && restaurant.specialDishes.length > 0 ? `<p style="margin: 0 0 8px 0; color: #92400e; font-size: 12px;"><strong>Must try:</strong> ${restaurant.specialDishes.join(', ')}</p>` : ''}
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 12px;">📍 ${restaurant.location}</p>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    ${restaurant.googleMapsUrl ? `<a href="${restaurant.googleMapsUrl}" style="background-color: #dc2626; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">📍 Maps</a>` : ''}
                    ${restaurant.website && restaurant.website !== 'null' ? `<a href="${restaurant.website}" style="background-color: #059669; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">🌐 Website</a>` : ''}
                </div>
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateSightseeingSection(sightseeing: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🏛️ Must-See Attractions
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">`;
    
    sightseeing.slice(0, 5).forEach(sight => {
      html += `
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; border-left: 4px solid #2563eb;">
                <h4 style="margin: 0 0 8px 0; color: #1d4ed8; font-size: 16px;">${sight.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <p style="margin: 0; color: #1e40af; font-size: 12px; font-weight: 500;">${sight.type} • ${sight.estimatedTime}</p>
                    ${sight.entranceFee ? `<span style="background-color: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">💳 ${sight.entranceFee}</span>` : ''}
                </div>
                <p style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 14px; line-height: 1.4;">${sight.description}</p>
                ${sight.bestTimeToVisit ? `<p style="margin: 0 0 8px 0; color: #1e40af; font-size: 12px;"><strong>Best time:</strong> ${sight.bestTimeToVisit}</p>` : ''}
                <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 12px;">📍 ${sight.location}</p>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    ${sight.googleMapsUrl ? `<a href="${sight.googleMapsUrl}" style="background-color: #2563eb; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">📍 Maps</a>` : ''}
                    ${sight.website && sight.website !== 'null' ? `<a href="${sight.website}" style="background-color: #059669; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">🌐 Website</a>` : ''}
                </div>
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateActivitiesSection(activities: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🎯 Unique Experiences
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">`;
    
    activities.slice(0, 4).forEach(activity => {
      html += `
            <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; border-left: 4px solid #059669;">
                <h4 style="margin: 0 0 8px 0; color: #047857; font-size: 16px;">${activity.name}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <p style="margin: 0; color: #065f46; font-size: 12px; font-weight: 500;">${activity.type} • ${activity.duration}</p>
                    ${activity.price ? `<span style="background-color: #059669; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">💰 ${activity.price}</span>` : ''}
                </div>
                <p style="margin: 0 0 10px 0; color: #064e3b; font-size: 14px; line-height: 1.4;">${activity.description}</p>
                ${activity.bookingRequired ? `<p style="margin: 0 0 8px 0; color: #dc2626; font-size: 12px; font-weight: 500;">⚠️ Advance booking required</p>` : ''}
                <p style="margin: 0 0 8px 0; color: #047857; font-size: 12px;">📍 ${activity.location}</p>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    ${activity.googleMapsUrl ? `<a href="${activity.googleMapsUrl}" style="background-color: #059669; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">📍 Maps</a>` : ''}
                    ${activity.website && activity.website !== 'null' ? `<a href="${activity.website}" style="background-color: #f59e0b; color: white; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">🎫 Book</a>` : ''}
                </div>
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateLocalTipsSection(tips: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            💡 Local Tips & Insights
        </h3>
        <div style="background-color: #f5f3ff; border-radius: 8px; padding: 20px; border-left: 4px solid #7c3aed;">`;
    
    // Handle both old format (strings) and new format (objects)
    const formattedTips = Array.isArray(tips) && tips.length > 0 
      ? (typeof tips[0] === 'string' 
          ? tips.map((tip, index) => ({ category: `Tip ${index + 1}`, tip, importance: 'medium' }))
          : tips)
      : [];
    
    formattedTips.slice(0, 6).forEach((tip, index) => {
      const importanceColor = tip.importance === 'high' ? '#dc2626' : tip.importance === 'low' ? '#6b7280' : '#7c3aed';
      const importanceIcon = tip.importance === 'high' ? '⚡' : tip.importance === 'low' ? '💡' : '⭐';
      
      html += `
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: ${index === formattedTips.length - 1 ? '0' : '18px'};">
                <span style="background-color: ${importanceColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">${importanceIcon}</span>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 4px 0; color: #5b21b6; font-size: 14px; font-weight: 600;">${tip.category}</h4>
                    <p style="margin: 0; color: #6d28d9; font-size: 13px; line-height: 1.5;">${tip.tip}</p>
                </div>
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateTransportationSection(transportation: any[]): string {
    let html = `
    <div style="margin-bottom: 30px;">
        <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🚗 Getting Around
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">`;
    
    transportation.forEach(transport => {
      html += `
            <div style="background-color: #fff7ed; border-radius: 8px; padding: 18px; border-left: 4px solid #ea580c;">
                <h4 style="margin: 0 0 10px 0; color: #c2410c; font-size: 16px; font-weight: 600;">${transport.type}</h4>
                <p style="margin: 0 0 8px 0; color: #9a3412; font-size: 14px; line-height: 1.4;">${transport.description}</p>
                <p style="margin: 0 0 10px 0; color: #c2410c; font-size: 13px; font-weight: 500;">💰 ${transport.cost}</p>
                ${transport.downloadApps && transport.downloadApps.length > 0 ? `
                <div style="margin-bottom: 8px;">
                    <p style="margin: 0 0 4px 0; color: #92400e; font-size: 12px; font-weight: 600;">📱 Recommended Apps:</p>
                    <p style="margin: 0; color: #78350f; font-size: 12px;">${transport.downloadApps.join(', ')}</p>
                </div>` : ''}
                ${transport.tips ? `<p style="margin: 0; color: #92400e; font-size: 12px;"><strong>💡 Tip:</strong> ${transport.tips}</p>` : ''}
            </div>`;
    });
    
    html += `
        </div>
    </div>`;
    
    return html;
  }

  private generateWeatherSection(weather: any): string {
    return `
    <div style="background-color: #f0f9ff; border-radius: 12px; padding: 25px; border-left: 4px solid #0ea5e9;">
        <h3 style="color: #0369a1; margin: 0 0 18px 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🌤️ Weather & Packing Guide
        </h3>
        <div style="margin-bottom: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #075985; font-size: 16px; font-weight: 600;">Current Weather</h4>
            <p style="margin: 0; color: #0369a1; font-size: 14px; line-height: 1.5;">${weather.description}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <h4 style="margin: 0 0 8px 0; color: #075985; font-size: 16px; font-weight: 600;">Travel Advice</h4>
            <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">${weather.suggestion}</p>
        </div>
        ${weather.whatToPack && weather.whatToPack.length > 0 ? `
        <div>
            <h4 style="margin: 0 0 10px 0; color: #075985; font-size: 16px; font-weight: 600;">🎒 Packing Essentials</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                ${weather.whatToPack.map(item => `
                <span style="background-color: #0ea5e9; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; text-align: center;">${item}</span>
                `).join('')}
            </div>
        </div>` : ''}
    </div>`;
  }

  private calculateTripStats(events: TravelEvent[]) {
    const datesWithTimes = events
      .filter(e => e.startDateTime)
      .map(e => e.startDateTime)
      .sort((a, b) => a.getTime() - b.getTime());

    const totalDays = datesWithTimes.length > 1 
      ? Math.ceil((datesWithTimes[datesWithTimes.length - 1].getTime() - datesWithTimes[0].getTime()) / (1000 * 60 * 60 * 24)) + 1
      : events.length > 0 ? 1 : 0;

    return {
      totalDays,
      flightCount: events.filter(e => e.type === 'flight').length,
      hotelCount: events.filter(e => e.type === 'hotel').length,
    };
  }

  private getEmojiForType(type: string): string {
    const emojiMap = {
      flight: '✈️',
      hotel: '🏨',
      car: '🚗',
      restaurant: '🍽️',
      activity: '🎫',
      train: '🚂',
      bus: '🚌',
      taxi: '🚕',
      booking: '📋',
      other: '📋',
    };
    
    return emojiMap[type.toLowerCase()] || '📋';
  }
}