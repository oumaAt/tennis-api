import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
config();
import * as fs from 'fs';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Load JSON data
  const seedService = app.get(SeedService);
  const jsonData = JSON.parse(fs.readFileSync('./src/seed/data.json', 'utf-8'));
  await seedService.importJsonData(jsonData);
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
