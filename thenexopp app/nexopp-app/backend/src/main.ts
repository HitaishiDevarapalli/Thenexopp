import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Increase payload size limit to support high-resolution property photos and KYC documents
  app.use(json({ limit: '250mb' }));
  app.use(urlencoded({ limit: '250mb', extended: true }));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Support both /api/v2 (primary) and /api/v1 transparently
  app.use((req: any, res: any, next: any) => {
    if (req.url.startsWith('/api/v1/')) {
      req.url = req.url.replace('/api/v1/', '/api/v2/');
    } else if (req.url === '/api/v1') {
      req.url = '/api/v2';
    }
    next();
  });

  app.setGlobalPrefix('api/v2');

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

  // Swagger OpenAPI Documentation Setup for /api/v2/doc, /api/v2/docs, /api/docs, /docs
  const config = new DocumentBuilder()
    .setTitle('TheNexopp Agent API v2')
    .setDescription('Production REST API Gateway for TheNexopp Agent Mobile Application & Partner Platform')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v2/doc', app, document, {
    customSiteTitle: 'TheNexopp Agent API Documentation v2',
    swaggerOptions: { persistAuthorization: true },
    useGlobalPrefix: false,
  });
  SwaggerModule.setup('api/v2/docs', app, document, {
    customSiteTitle: 'TheNexopp Agent API Documentation v2',
    swaggerOptions: { persistAuthorization: true },
    useGlobalPrefix: false,
  });
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

  const port = process.env.AGENT_PORT || (process.env.PORT && process.env.PORT !== '8081' ? process.env.PORT : 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`TheNexopp Agent Backend running on port ${port}`);
  logger.log(`Swagger OpenAPI Documentation available at http://localhost:${port}/api/v2/doc & http://localhost:${port}/api/v2/docs`);
}
bootstrap();
