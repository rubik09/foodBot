// import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
// import { UpdateService } from './update.service';
// import { AuthGuard } from '../auth/auth.guard';
// import { UpdateLanguageDto } from './dto/updateLanguage.dto';
// @Controller('update-buttons')
// @UseGuards(AuthGuard)
// export class UpdateController {
//   constructor(private updateService: UpdateService) {}
//   @Get()
//   async updateFromGoogleSheet(@Query() languageDto: UpdateLanguageDto) {
//     return this.updateService.updateBotStructure(languageDto.lang).catch((err) => {
//       throw new HttpException(err, HttpStatus.NOT_FOUND);
//     });
//   }
//   @Get('test')
//   async test() {
//     return this.updateService.findAll();
//   }
// }
// // 