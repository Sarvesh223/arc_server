import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;
  private messaging: admin.messaging.Messaging;

  onModuleInit() {
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'nizaul',
        clientEmail: 'firebase-adminsdk-fbsvc@nizaul.iam.gserviceaccount.com',
        privateKey:
          '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC654yrgFNpP0Ec\nti8AgHuXZGx24hL6LqZkJ17RDfvj2GwQrXXviOcZGF8+NV8fXszRw+ZvQxAqWKUg\ndlIpMqGU8zSZIECvrnO+aF3/ICggAgiu7OKYPV9yqF12REBofM2KKNRH3ZAxiEzk\nFnbmhVh57SezeWvFw4beViAf+/acAAvUQc2872qVm4/Te9L5FqLTe4XU3qjY+82X\nXQz7ZaAepgs36TOgTSzIGaAgXBCnd3OSC35pMQn0itSoZU72wwY/oaLBZt+hQvMG\nQkIS5idS3g+bHF2z+fw3b9qkKSOTjneu2vkpZwjsVxcP7QWtVYjNAwVW/IXq89Dc\nTyffr8K/AgMBAAECggEAXD+t1/Xx9VfhkMTAxRwlJA9OU4z4td+xg2xFKaSfxxDK\nIZ8jvvLQsTuswp0AEpEtQXlRsmekwmnXMoMDwU66nrQ9KTjYhH1zpi6H+kSKWWX3\nmDLWEjL0ebhszNMaARhcME0/nSrXoQL3hHor/FIjXaZ2Omh7D3SWjAVxPKgVS2AH\ncq1GwNOQa3GAC2ED9VkU5M+RPeI3JU+fosCT4n0qDtSx1e2EMa5+lZAL/MEVO/yx\nVKwSl+3FWgBY2/ZkOXcnPjY/JFdxsMR/Wd7nhO2vLG6xJbE9/S3q6Y0l9/pzD8kD\nheMk7b5+/YVKrxYUfT7sjtYscf6GSkzRUsPcJOXvxQKBgQDx1R1ha0RRcEuOJ8NC\nAX26LO3Ehp8zKDqQK88O8tFXrqqUmM/8O/Qarf8MJ2fU7mC748ipSdQLpmj3jLBb\nvdhsojMQCxC3D66vSlsjoIEjZRbj5iKx3H1wgdsw1nyNt5WW86Cmt079izOFi3+o\n94Pc8Km3/zmNoWpR7uJh0eeCdQKBgQDF2qbP0yHIeqo6zBP/X27BW2BGb73Wy3am\n6S4/efKAmvNz6OyeSck55QaH23T1oyimF5zyVY22LA5Az2cuw0RuARfGLaLWAENe\nGwHIeJ0WXkPbIeCAmT7GHPb7hod4kAemw4pcYQb+xJNyhZq149Vebdj2KFPUvdZA\nb3moqn4h4wKBgQDhRn+aEoyPuKYJhKz1veHbHqNXYXjH9P+o8cZuzG+K2KD6z+df\ntpHMkK14KvUke/MM1EJGwQmQ2LILeLmInK8Rc39RwJ0PisJVdFS2OXxS9oZ+QhGr\n0hPgTHddZVCdy5jEB6tt4nDo61VRYAPJ6NijZmUTi+OXNfiO3pNwQFMDSQKBgEqF\nLEcikprb+Lnkm7OX0jNpoz1kYPBB+hKryQuHdtsRgZiqplSIHg58QJVzBv5t0aWd\nRzPPHWz78vJeK9LlIST9rGKsVaScvML5ERbctu3x20Tx4YkOLyKXTj82UFgMh5U8\nGSTqNqRGjfKYd8kCYx8J6KnuToTWa5ghZIUukgtZAoGBAK8ub7IniW0wv8FNAmZH\nQ6QVCbc6zlHNg2f/ijFf3L56bSI9It2mgZHsEnisfkVgLWFOH+XKIv7eIrVR8LxC\n9OHtAaJh60QykBg8RL8xrKx4feYs7zfyPwRaST6NhNIVMKwps3PrZcBiNtvqaFfn\ncBW4myYUsBB16pORFSg6/g0L\n-----END PRIVATE KEY-----\n'.replace(
            /\\n/g,
            '\n',
          ),
      }),
    });

    this.firestore = admin.firestore();
    this.messaging = admin.messaging();
  }

  async getAllFCMTokens(): Promise<string[]> {
    try {
      const usersSnapshot = await this.firestore.collection('users').get();
      const fcmTokens: string[] = [];

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        // Updated to use fcm_token instead of fcmToken
        if (userData.fcm_token) {
          if (typeof userData.fcm_token === 'string') {
            fcmTokens.push(userData.fcm_token);
          }
        }
      });

      console.log(`Found ${fcmTokens.length} FCM tokens`);

      return fcmTokens;
    } catch (error) {
      console.error('Error fetching FCM tokens:', error);
      throw error;
    }
  }

  async sendNotificationToAll(
    title: string,
    body: string,
    data?: Record<string, string>,
    urgent: boolean = false,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const fcmTokens = await this.getAllFCMTokens();

      if (fcmTokens.length === 0) {
        throw new Error('No FCM tokens found');
      }

      // Define Android-specific configuration for urgent notifications
      const androidConfig: admin.messaging.AndroidConfig = {
        priority: urgent ? 'high' : 'normal',
        notification: {
          channelId: 'Main notification',
          priority: urgent ? 'high' : 'default',
        },
      };

      // Define Apple-specific configuration
      const apnsConfig: admin.messaging.ApnsConfig = {
        headers: {
          'apns-priority': urgent ? '10' : '5',
        },
        payload: {
          aps: {
            sound: urgent ? 'default' : undefined,
            category: 'Main notification',
            contentAvailable: true,
          },
        },
      };

      // Merge data with channel information if not provided
      const notificationData = {
        ...data,
        channel_id: 'Main notification',
        urgent: urgent ? 'true' : 'false',
      };

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: notificationData,
        android: androidConfig,
        apns: apnsConfig,
        tokens: fcmTokens,
      };

      console.log(`Sending notification to ${fcmTokens.length} devices`);

      const response = await this.messaging.sendEachForMulticast(message);

      // Add detailed logging for failures
      if (response.failureCount > 0) {
        console.log(`Failed to send ${response.failureCount} notifications`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(
              `Failed to send to token ${fcmTokens[idx]}: ${resp.error?.message}`,
            );
          }
        });
      }

      return response;
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  }

  // Utility method to validate tokens (useful for debugging)
  async validateTokens(): Promise<{ valid: string[]; invalid: string[] }> {
    const tokens = await this.getAllFCMTokens();
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const token of tokens) {
      try {
        // Dry run checks token validity without sending actual message
        await this.messaging.send(
          {
            token,
            notification: {
              title: 'Token validation',
              body: 'Validating token',
            },
          },
          true, // dryRun=true
        );
        valid.push(token);
      } catch (error) {
        invalid.push(token);
        console.log(`Invalid token: ${token}`, error);
      }
    }

    return { valid, invalid };
  }

  // Method to test sending to a specific token with correct return type
  async sendToToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
    urgent: boolean = false,
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          channel_id: 'Main notification',
          urgent: urgent ? 'true' : 'false',
        },
        android: {
          priority: urgent ? 'high' : 'normal',
          notification: {
            channelId: 'Main notification',
            priority: urgent ? 'high' : 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': urgent ? '10' : '5',
          },
          payload: {
            aps: {
              sound: urgent ? 'default' : undefined,
              category: 'Main notification',
              contentAvailable: true,
            },
          },
        },
        token,
      };

      // The send method returns a message ID string in newer Firebase versions
      return await this.messaging.send(message);
    } catch (error) {
      console.error('Error sending notification to token:', error);
      throw error;
    }
  }
}
