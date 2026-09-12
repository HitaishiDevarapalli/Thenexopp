import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Increase payload size limit to support high-resolution property photos and KYC documents
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('TheNexopp Agent API')
    .setDescription('Production REST API & Real-time WebSocket Gateway for TheNexopp Agent Mobile Application')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'TheNexopp Agent API Documentation',
    swaggerOptions: { persistAuthorization: true },
    useGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'TheNexopp Agent API Documentation',
    swaggerOptions: { persistAuthorization: true },
    useGlobalPrefix: false,
  });
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'TheNexopp Agent API Documentation',
    swaggerOptions: { persistAuthorization: true },
    useGlobalPrefix: false,
  });


  const port = process.env.AGENT_PORT || (process.env.PORT && process.env.PORT !== '8081' ? process.env.PORT : 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`TheNexopp Agent Backend running on port ${port}`);
  logger.log(`Swagger OpenAPI Documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
