import {
  Controller,
  Get,
  HttpCode,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { FindPlayerByIdDto } from './player.dto';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('')
  @HttpCode(200)
  async findAll() {
    const players = await this.playerService.findAllSorted();
    return { data: players };
  }

  @Get('statistics')
  @HttpCode(200)
  async getStatistics() {
    const result = await this.playerService.getStatistics();
    return { result };
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findById(
    @Param() params: FindPlayerByIdDto, // Validate the id parameter using the DTO
  ) {
    console.log('id', params.id);
    const player = await this.playerService.findById(params.id);
    return { data: player };
  }
}
