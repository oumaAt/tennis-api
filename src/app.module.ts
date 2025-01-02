import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { PlayerModule } from './player/player.module';
import { config } from 'dotenv';
config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database:
        process.env.NODE_ENV === 'dev' ? 'database.sqlite' : 'test.sqlite',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: true,
    }),
    PlayerModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
