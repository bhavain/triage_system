import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { InsightsModule } from './modules/insights/insights.module';
import { PrioritizationModule } from './modules/prioritization/prioritization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FeedbackModule,
    InsightsModule,
    PrioritizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
