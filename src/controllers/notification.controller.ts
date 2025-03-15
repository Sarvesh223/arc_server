import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from '../services/firebase.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

export class NotificationDto {
  title: string;
  body: string;
  data?: Record<string, string>;
}

class NotificationResponseDto {
  success: boolean;
  sent?: number;
  failed?: number;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('send-to-all')
  @ApiOperation({ summary: 'Send notification to all users' })
  @ApiBody({ type: NotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
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
