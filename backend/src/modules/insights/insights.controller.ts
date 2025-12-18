import { Controller, Get, Query } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('api/insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('urgent')
  async getUrgentQueue(
    @Query('min_urgency') minUrgency?: string,
    @Query('hours') hours?: string,
  ) {
    const minUrg = minUrgency ? parseInt(minUrgency, 10) : 70;
    const hrs = hours ? parseInt(hours, 10) : 24;

    return this.insightsService.getUrgentQueue(minUrg, hrs);
  }

  @Get('trends')
  async getTrends(
    @Query('period') period?: 'day' | 'week' | 'month',
    @Query('group_by') groupBy?: 'category' | 'source' | 'customer_tier',
  ) {
    return this.insightsService.getTrends(period || 'week', groupBy || 'category');
  }

  @Get('summary')
  async getSummary(
    @Query('period') period?: 'week' | 'month' | 'quarter',
  ) {
    return this.insightsService.getSummary(period || 'month');
  }
}
