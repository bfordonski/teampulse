import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CandidateModule } from './modules/candidate/candidate.module';
import { TeamModule } from './modules/team/team.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule, CandidateModule, TeamModule],
  controllers: [AppController],
})
export class AppModule {}
