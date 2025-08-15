import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsCatcher } from './common/exception-catcher.filter';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorBody } from './common/response-body';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
app.enableCors({
  origin: ['http://localhost:3000','http://127.0.0.1:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});

  app.useGlobalFilters(
  new AllExceptionsCatcher(),
);

  const config = new DocumentBuilder()
    .setTitle('Chat-system API')
    .setDescription('Description')
    .setVersion('1.0')
    .addBearerAuth(
    {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWE',
            name: 'Authorization',
            description: 'Enter JWE token',
            in: 'header',
          },
    'token',
  )
    .build();

  const document = SwaggerModule.createDocument(app, config,{extraModels: [ErrorBody],
});

  SwaggerModule.setup('api-docs', app, document); // Swagger will be served at /api-docs


  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
