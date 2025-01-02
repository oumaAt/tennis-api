import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
config();
import * as fs from 'fs';
import { SeedService } from './seed/seed.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Load JSON data
  const seedService = app.get(SeedService);
  const jsonData = JSON.parse(fs.readFileSync('./src/seed/data.json', 'utf-8'));
  await seedService.importJsonData(jsonData);
  app.setGlobalPrefix('api', { exclude: ['/'] });

  const config = new DocumentBuilder()
    .setTitle('Tennis ')
    .setDescription('The Tennis API description')
    .setVersion('1.0')
    .addTag('players')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);
  await app.listen(3000);
}
bootstrap();
