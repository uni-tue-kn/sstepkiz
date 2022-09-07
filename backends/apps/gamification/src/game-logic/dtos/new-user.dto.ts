import { IsString, MaxLength } from "class-validator";

export class NewUserDto {

  /**
     * Id of the user
     */
    @IsString()
    @MaxLength(30)
    id: string;

}