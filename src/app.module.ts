import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './modules/database/person/person.module';
import { ChannelModule } from './modules/database/channel/channel.module';
import { ElementsModule } from './modules/database/elements/elements.module';
import { MessageModule } from './modules/database/message/message.module';
import { ProfileModule } from './modules/api/profile/profile.module';
import { ShoutoutsModule } from './modules/api/shoutouts/shoutouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProfileModule,
    ShoutoutsModule,
    PersonModule,
    ChannelModule,
    ElementsModule,
    MessageModule,
    ProfileModule,
    ShoutoutsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
