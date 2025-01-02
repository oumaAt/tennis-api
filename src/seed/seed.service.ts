import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../player/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async importJsonData(jsonData: { players: any[] }): Promise<void> {
    if (
      !jsonData?.players ||
      !Array.isArray(jsonData.players) ||
      jsonData.players.length === 0
    ) {
      Logger.error('No players found in the provided JSON data.');
      return;
    }

    const players = jsonData.players;
    const successfulPlayers = [];
    const failedPlayers = [];
    const playersCount = await this.playerRepository.count();
    if (playersCount > 0) return;

    for (const playerData of players) {
      try {
        const newPlayer = this.playerRepository.create(playerData);
        await this.playerRepository.save(newPlayer);
        successfulPlayers.push(playerData);
      } catch (error) {
        failedPlayers.push({ playerData, error: error.message });
      }
    }

    Logger.log(`Successfully imported ${successfulPlayers.length} players.`);
    if (failedPlayers.length > 0) {
      Logger.warn(
        `${failedPlayers.length} players failed to import. Errors:`,
        failedPlayers,
      );
    }
  }
}
