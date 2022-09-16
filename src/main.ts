import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import { SlackService } from './slack/slack.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('DEPT® Shoutouts')
    .setDescription(
      'This API facilitates the ability to track who gives and receives shoutouts at DEPT®.',
    )
    .setVersion('1.0')
    .addTag('shoutouts')
    .addTag('profile')
    .setBasePath('/api')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const slack = app.get(SlackService);
  app.use('/slack/events', slack.use());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  await app.listen(process.env.PORT);
}
bootstrap();
