import { IsString, IsUrl, validateOrReject } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum Sex {
  FEMME = 'F',
  HOMME = 'M',
  AUTRE = 'OTHER',
}

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  firstname: string;

  @Column()
  @IsString()
  lastname: string;

  @Column()
  @IsString()
  shortname: string;

  @Column({
    type: 'text',
    enum: Sex,
    default: Sex.FEMME,
  })
  sex: Sex;

  @Column()
  @IsString({ message: 'Each picture URL must be a string' })
  @IsUrl({}, { message: 'Each picture must be a valid URL' })
  picture: string;

  @Column('simple-json')
  country: {
    picture: string;
    code: string;
  };

  @Column('simple-json')
  data: {
    rank: number;
    points: number;
    weight: number;
    height: number;
    age: number;
    last: number[];
  };

  async validate() {
    await validateOrReject(this);
  }
}
