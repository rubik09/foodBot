
import { IsNotEmpty } from 'class-validator';

export class UpdateLanguageDto {
  @IsNotEmpty()
  lang: string;
}
