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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('players') // Group endpoints under "players"
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({
    summary: 'Return list of players sorted by rank',
    description: 'Retrieve players details .',
  })
  @Get('')
  @HttpCode(200)
  async findAll() {
    const players = await this.playerService.findAllSorted();
    return { data: players };
  }

  @ApiOperation({
    summary: 'Statistics',
    description: 'Calculate statistics .',
  })
  @Get('statistics')
  @HttpCode(200)
  async getStatistics() {
    const result = await this.playerService.getStatistics();
    return { result };
  }

  @ApiResponse({
    status: 200,
    description: 'Player details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Player not found.',
  })
  @Get(':id')
  @ApiOperation({
    summary: 'Find player by ID',
    description: 'Retrieve player details using the player ID.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The unique ID of the player',
    type: Number,
  })
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  async findById(
    @Param() params: FindPlayerByIdDto, // Validate the id parameter using the DTO
  ) {
    const player = await this.playerService.findById(params.id);
    return { data: player };
  }
}
