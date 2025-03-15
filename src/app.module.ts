import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './controllers/notification.controller';
import { FirebaseService } from './services/firebase.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [NotificationController],
  providers: [FirebaseService],
})
export class AppModule {}
