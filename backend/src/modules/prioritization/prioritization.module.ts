import { Module } from '@nestjs/common';
import { PrioritizationService } from './prioritization.service';
import { CategorizationService } from './categorization.service';

@Module({
  providers: [PrioritizationService, CategorizationService],
  exports: [PrioritizationService, CategorizationService],
})
export class PrioritizationModule {}
