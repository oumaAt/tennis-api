import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { PlayerService } from './player.service';

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
  @HttpCode(200)
  async findById(@Param() id: number) {
    const player = await this.playerService.findById(id);
    return { data: player };
  }
}
