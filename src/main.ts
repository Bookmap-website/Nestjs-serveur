import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - is used to access the API from the frontend - else there is an error
  // origin * permits any hosts to make requests (exemple : http:localhost:3000 or https:192.168.0.32:3000)
  app.enableCors({
    origin: '*',
    // allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'] + Authorization ('Bearer')
    // if we use cookies then, we need to add 'credentials: true'
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(3000);
}
bootstrap();
