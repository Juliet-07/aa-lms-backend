import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'AA LMS Backend Service!';
  }

  healthCheck() {
    return {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      apiInfo: {
        name: 'AA-LMS API',
        description: 'Backend API for LMS (Kujua360) application',
      },
    };
  }
}
