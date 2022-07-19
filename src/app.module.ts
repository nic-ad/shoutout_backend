import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { ShoutoutsModule } from './shoutouts/shoutouts.module';
import { PersonModule } from './database/modules/person/person.module';
import { ChannelModule } from './database/modules/channel/channel.module';
import { ElementsModule } from './database/modules/elements/elements.module';
import { MessageModule } from './database/modules/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProfileModule,
    ShoutoutsModule,
    PersonModule,
    ChannelModule,
    ElementsModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
