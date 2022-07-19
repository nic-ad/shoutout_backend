import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileModule } from './profile/profile.module';
import { ShoutoutsModule } from './shoutouts/shoutouts.module';

@Module({
  imports: [ProfileModule, ShoutoutsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}