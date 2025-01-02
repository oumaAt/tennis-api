import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Player } from './player.entity';
  import { Repository } from 'typeorm';
  
  const getBestCountry = (
    countryRatios: Record<string, { wins: number; matches: number }>,
  ) => {
    let bestCountry = '';
    let bestRatio = 0;
  
    for (const country in countryRatios) {
      const { wins, matches } = countryRatios[country];
      const ratio = matches > 0 ? wins / matches : 0;
  
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestCountry = country;
      }
    }
  
    return bestCountry;
  };
  
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
  
      if (!players || players.length === 0) {
        throw new NotFoundException('No players found');
      }
      const countryRatios: Record<string, { wins: number; matches: number }> = {};
      for (const player of players) {
        const wins = player.data.last.filter(
          (match: number) => match == 1,
        ).length;
        console.log({ wins });
        const matches = player.data.last.length;
        if (!player.country) continue;
        const countryCode = player.country.code;
        if (!countryCode) {
          throw new BadRequestException('No valid country data found');
        }
  
        if (!countryRatios[countryCode]) {
          countryRatios[countryCode] = { wins: 0, matches: 0 };
        }
  
        countryRatios[countryCode].wins += wins;
        countryRatios[countryCode].matches += matches;
      }
      console.log({ countryRatios });
  
      if (Object.keys(countryRatios).length === 0) {
        throw new BadRequestException('No valid country data found');
      }
      const bestCountry = getBestCountry(countryRatios);
      console.log({ bestCountry });
  
      // IMC moyen de tous les joueurs
      const totalIMC = players.reduce((sum, player) => {
        const weight = player.data.weight / 1000; // Convertir en kg
        const height = player.data.height / 100; // Convertir en m
  
        if (height === 0) {
          throw new BadRequestException(`Invalid height for player ${player.id}`);
        }
        return sum + weight / (height * height);
      }, 0);
      const averageIMC = totalIMC / players.length;
  
      // Médiane de la taille des joueurs
      const heights = players
        .map((player) => player.data.height)
        .sort((a, b) => a - b);
  
      if (heights.length === 0) {
        throw new BadRequestException('No valid height data found');
      }
  
      const medianHeight =
        heights.length % 2 === 0
          ? (heights[heights.length / 2 - 1] + heights[heights.length / 2]) / 2
          : heights[Math.floor(heights.length / 2)];
  
      return {
        bestCountry: bestCountry,
        averageIMC: averageIMC.toFixed(2),
        medianHeight,
      };
    }
  }
  