import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend URL (adjust as needed)
    credentials: true, // Allow sending cookies
  });
  // Enable global validation and auto-transform of query params
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically converts query params to the correct type
      whitelist: true, // Strips out unknown properties
      forbidNonWhitelisted: true, // Throws error on unknown properties
    }),
  );
  //swagger
  const config = new DocumentBuilder()
    .setTitle('QR Menu')
    .setDescription('Qr Menu API description')
    .setVersion('1.0')
    .addTag('qr-menu')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log('App is listening on port:', port);
}
bootstrap();
