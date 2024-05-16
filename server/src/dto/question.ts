import { IsString, Length } from 'class-validator';

export class ExecDto {
  @IsString()
  name: string;

  @IsString()
  @Length(1, 10000)
  code: string;
}

export class getQuestDto {
  @IsString()
  @Length(1, 200)
  name: string;
}
