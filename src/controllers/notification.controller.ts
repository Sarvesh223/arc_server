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
  @Post('validate-tokens')
  @ApiOperation({ summary: 'Validate all FCM tokens' })
  async validateTokens() {
    try {
      const result = await this.firebaseService.validateTokens();
      return {
        success: true,
        valid: result.valid.length,
        invalid: result.invalid.length,
        validTokens: result.valid,
        invalidTokens: result.invalid,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  }
  @Post('send-to-token')
  @ApiOperation({ summary: 'Send notification to a specific token' })
  @ApiBody({
    schema: {
      properties: {
        token: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        data: { type: 'object' },
        urgent: { type: 'boolean' },
      },
    },
  })
  async sendToToken(
    @Body()
    body: {
      token: string;
      title: string;
      body: string;
      data?: Record<string, string>;
      urgent?: boolean;
    },
  ) {
    try {
      await this.firebaseService.sendToToken(
        body.token,
        body.title,
        body.body,
        body.data,
        body.urgent,
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  }
}
