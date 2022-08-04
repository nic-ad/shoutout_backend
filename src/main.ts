import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SlackService } from './slack/slack.service';

async function bootstrap() {
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const slack = app.get(SlackService);
  app.use('/slack/events', slack.use());

  await app.listen(3000);
}
bootstrap();
