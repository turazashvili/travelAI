import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting Travel Itinerary Builder...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('Postmark Token:', process.env.POSTMARK_API_TOKEN ? 'SET' : 'NOT SET');
    
    const app = await NestFactory.create(AppModule);
    
    app.enableCors();
    
    const port = process.env.PORT || 8080;
    await app.listen(port);
    
    console.log(`✅ Travel Itinerary Builder running on port ${port}`);
    console.log(`📧 Health check: http://localhost:${port}/email/health`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();