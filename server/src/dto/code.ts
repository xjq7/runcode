import { IsString, Length } from 'class-validator';
import { CodeType } from 'src/constants/code';

export class CodeRunDto {
  @IsString()
  @Length(1, 100000)
  code: string;

  @IsString()
  @Length(1, 100)
  type: CodeType;

  @IsString()
  @Length(0, 5000)
  stdin: string;
}
