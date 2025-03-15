import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from '../services/firebase.service';

interface NotificationDto {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('send-to-all')
  async sendToAll(@Body() notificationDto: NotificationDto) {
    const { title, body, data } = notificationDto;

    try {
      const response = await this.firebaseService.sendNotificationToAll(
        title,
        body,
        data,
      );

      return {
        success: true,
        sent: response.successCount,
        failed: response.failureCount,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  }
}
