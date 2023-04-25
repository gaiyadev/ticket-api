import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GetUser } from './custom-decorators/user-auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { SignInDto } from './dtos/sign-in.dto';
import { CreateStudentDto } from '../student/dto/create-student.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @UsePipes(ValidationPipe)
  async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
    return await this.userService.signUp(signUpDto);
  }

  /*
   * Signin
   * */
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  @UsePipes(ValidationPipe)
  async signIn(@Body() signInDto: SignInDto): Promise<any> {
    return await this.userService.signIn(signInDto);
  }

  @Post('/add')
  @UsePipes(ValidationPipe)
  async addStudent(@Body() createStudentDto: CreateStudentDto): Promise<any> {
    return await this.userService.addStudent(createStudentDto);
  }

  @Get('/')
  async findAll(): Promise<any> {
    return await this.userService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.userService.findOne(id);
  }

  @Delete('/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.userService.remove(id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Put('/change-password')
  @UseGuards(AuthGuard('user'))
  @UsePipes(ValidationPipe)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ): Promise<any> {
    return await this.userService.changePassword(changePasswordDto, user);
  }

  @Post('/admin')
  @UsePipes(ValidationPipe)
  async createAdmin(@Body() signUpDto: SignUpDto): Promise<any> {
    return await this.userService.createAdmin(signUpDto);
  }

  @Get('/active/counts')
  async StudentsCount() {
    return await this.userService.StudentsCount();
  }
}
