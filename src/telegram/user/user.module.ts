import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { UserProvider } from './user.provider';


@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UserService,UserProvider], 
    exports: [UserService]
})
export class UserModule {}
