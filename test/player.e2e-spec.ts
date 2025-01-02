import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('PlayerController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    // Ajouter des données pour les tests
    await seedDatabase(dataSource);
  });

  afterAll(async () => {
    // Supprimer les données après les tests
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('/players (GET)', () => {
    it('should return a list of players sorted by rank', async () => {
      const response = await request(app.getHttpServer())
        .get('/players')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('firstname');
      expect(response.body.data[0].data.rank).toBeLessThanOrEqual(
        response.body.data[1].data.rank,
      );
    });
  });

  describe('/players/statistics (GET)', () => {
    it('should return statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/players/statistics')
        .expect(200);

      expect(response.body.result).toHaveProperty('averageIMC');
      expect(response.body.result).toHaveProperty('bestCountry');
      expect(response.body.result).toHaveProperty('medianHeight');
    });
  });

  describe('/players/:id (GET)', () => {
    it('should return player details for a valid ID', async () => {
      const validId = 52; // Exemple d'ID de joueur existant
      const response = await request(app.getHttpServer())
        .get(`/players/${validId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', validId);
      expect(response.body.data).toHaveProperty('firstname', 'Novak');
      expect(response.body.data).toHaveProperty('lastname', 'Djokovic');
    });

    it('should return 404 for a non-existent player ID', async () => {
      const invalidId = 999;
      await request(app.getHttpServer())
        .get(`/players/${invalidId}`)
        .expect(404);
    });
  });
});

//  injecter des données de test
async function seedDatabase(dataSource: DataSource) {
  const playerRepository = dataSource.getRepository('Player');
  await playerRepository.save([
    {
      id: 52,
      firstname: 'Novak',
      lastname: 'Djokovic',
      shortname: 'N.DJO',
      sex: 'M',
      country: { picture: 'URL', code: 'SRB' },
      picture: 'URL',
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
      country: { picture: 'URL', code: 'USA' },
      picture: 'URL',
      data: {
        rank: 52,
        points: 1105,
        weight: 74000,
        height: 185,
        age: 38,
        last: [0, 1, 0, 0, 1],
      },
    },
  ]);
}
