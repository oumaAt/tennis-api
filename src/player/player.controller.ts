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

  @ApiResponse({
    status: 200,
    description: 'Players details retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'No Player is found.',
  })
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

  @ApiResponse({
    status: 200,
    description:
      'Statictics : (Country with the highest ratio of games won, Average BMI of all players, Median player height).',
  })
  @ApiResponse({
    status: 400,
    description: 'Error occured when calculating statictics.',
  })
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
  @ApiResponse({
    status: 400,
    description: 'Error occured retrieving player details.',
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
