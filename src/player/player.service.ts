import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  async findAllSorted(): Promise<Player[]> {
    let players = await this.playerRepository.find({
      order: {
        data: {
          rank: 'ASC',
        },
      },
    });
    if (!players || players.length === 0) {
      throw new NotFoundException('No players found');
    }
    return players;
  }

  async findById(id: number): Promise<Player> {
    console.log({ id });
    const player = await this.playerRepository.findOne({
      where: { id },
    });
    console.log({ player });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }

  async getStatistics() {
    const players = await this.findAllSorted();

    if (!players?.length) {
      throw new NotFoundException('No players found');
    }

    const countryStats = this.calculateCountryStats(players);
    const averageIMC = this.calculateAverageIMC(players);
    const medianHeight = this.calculateMedianHeight(players);

    return {
      bestCountry: this.getBestCountry(countryStats),
      averageIMC: averageIMC.toFixed(2),
      medianHeight,
    };
  }

  private getBestCountry(countryRatios: CountryRatios): string {
    return Object.entries(countryRatios)
      .map(([country, { wins, matches }]) => ({
        country,
        ratio: matches > 0 ? wins / matches : 0,
      }))
      .reduce(
        (best, current) => (current.ratio > best.ratio ? current : best),
        { country: '', ratio: 0 },
      ).country;
  }

  private calculateCountryStats(players: Player[]) {
    const countryRatios: Record<string, { wins: number; matches: number }> = {};

    for (const player of players) {
      const { country, data } = player;
      if (!country?.code) continue;

      const wins = data.last.filter((match: number) => match === 1).length;
      const matches = data.last.length;

      countryRatios[country.code] = {
        wins: (countryRatios[country.code]?.wins ?? 0) + wins,
        matches: (countryRatios[country.code]?.matches ?? 0) + matches,
      };
    }

    if (!Object.keys(countryRatios).length) {
      throw new BadRequestException('No valid country data found');
    }

    return countryRatios;
  }

  private calculateAverageIMC(players: Player[]) {
    return (
      players.reduce((sum, { data: { weight, height } }) => {
        const weightKg = weight / 1000;
        const heightM = height / 100;

        if (!heightM) {
          throw new BadRequestException('Invalid height found');
        }

        return sum + weightKg / (heightM * heightM);
      }, 0) / players.length
    );
  }

  private calculateMedianHeight(players: Player[]) {
    const heights = players
      .map((player) => player.data.height)
      .sort((a, b) => a - b);

    if (!heights.length) {
      throw new BadRequestException('No valid height data found');
    }

    const mid = Math.floor(heights.length / 2);
    return heights.length % 2 === 0
      ? (heights[mid - 1] + heights[mid]) / 2
      : heights[mid];
  }
}
