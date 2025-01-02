import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PlayerService', () => {
  let playerService: PlayerService;
  let playerRepository: Repository<Player>;

  const mockPlayer = {
    id: 52,
    firstname: 'Novak',
    lastname: 'Djokovic',
    shortname: 'N.DJO',
    sex: 'M',
    country: {
      picture:
        'https://data.latelier.co/training/tennis_stats/resources/Serbie.png',
      code: 'SRB',
    },
    picture:
      'https://data.latelier.co/training/tennis_stats/resources/Djokovic.png',
    data: {
      rank: 2,
      points: 2542,
      weight: 80000,
      height: 188,
      age: 31,
      last: [1, 1, 1, 1, 1],
    },
  };

  const mockRepository = {
    findOne: jest.fn((options) =>
      options.where.id === 1
        ? Promise.resolve(mockPlayer)
        : Promise.resolve(null),
    ),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockRepository,
        },
      ],
    }).compile();

    playerService = module.get<PlayerService>(PlayerService);
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
  });

  it('should be defined', () => {
    expect(playerService).toBeDefined();
  });

  describe('findById', () => {
    it('non-existent player ID should throw an error', async () => {
      await expect(playerService.findById(9999)).rejects.toThrow(
        new BadRequestException('Player not found'),
      );
    });

    it('valid player ID to return the player data', async () => {
      const result = await playerService.findById(1);
      expect(result).toEqual(mockPlayer);
    });
  });

  describe('findAllSorted', () => {
    it('should throw an error if no players are found', async () => {
      mockRepository.find.mockResolvedValue([]);

      await expect(playerService.findAllSorted()).rejects.toThrow(
        new BadRequestException('No players found'),
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(playerService.findAllSorted()).rejects.toThrow(
        'Database error',
      );
    });

    it('should return a sorted list of players', async () => {
      const mockPlayers = [
        {
          id: 52,
          firstname: 'Novak',
          lastname: 'Djokovic',
          shortname: 'N.DJO',
          sex: 'M',
          country: {
            picture:
              'https://data.latelier.co/training/tennis_stats/resources/Serbie.png',
            code: 'SRB',
          },
          picture:
            'https://data.latelier.co/training/tennis_stats/resources/Djokovic.png',
          data: {
            rank: 2,
            points: 2542,
            weight: 80000,
            height: 188,
            age: 31,
            last: [1, 1, 1, 1, 1],
          },
        },
        {
          id: 95,
          firstname: 'Venus',
          lastname: 'Williams',
          shortname: 'V.WIL',
          sex: 'F',
          country: {
            picture:
              'https://data.latelier.co/training/tennis_stats/resources/USA.png',
            code: 'USA',
          },
          picture:
            'https://data.latelier.co/training/tennis_stats/resources/Venus.webp',
          data: {
            rank: 52,
            points: 1105,
            weight: 74000,
            height: 185,
            age: 38,
            last: [0, 1, 0, 0, 1],
          },
        },
      ];

      mockRepository.find.mockResolvedValue(mockPlayers);

      const result = await playerService.findAllSorted();

      expect(result).toEqual(mockPlayers);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: {
          data: {
            rank: 'ASC',
          },
        },
      });
    });
  });

  describe('getStatistics', () => {
    it('should throw an error if no players are found', async () => {
      mockRepository.find.mockResolvedValue([]);

      await expect(playerService.getStatistics()).rejects.toThrow(
        new BadRequestException('No players found'),
      );
    });

    it('should throw an error if a player is missing a country code', async () => {
      const invalidPlayer = { ...mockPlayer, country: null };
      mockRepository.find.mockResolvedValue([invalidPlayer]);

      await expect(playerService.getStatistics()).rejects.toThrow(
        new BadRequestException('No valid country data found'),
      );
    });

    it('should throw an error if a player has an invalid height', async () => {
      const invalidPlayer = {
        ...mockPlayer,
        data: { ...mockPlayer.data, height: 0 },
      };
      mockRepository.find.mockResolvedValue([invalidPlayer]);

      await expect(playerService.getStatistics()).rejects.toThrow(
        new BadRequestException('Invalid height found'),
      );
    });

    it('should return statistics for valid player data', async () => {
      mockRepository.find.mockResolvedValue([mockPlayer]);

      const result = await playerService.getStatistics();

      expect(result).toEqual({
        bestCountry: expect.any(String),
        averageIMC: expect.any(String),
        medianHeight: expect.any(Number),
      });
    });
  });
});
