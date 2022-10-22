import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignUpDto } from './dtos/sign-up.dto';
import { Wallet } from '../wallet/entities/wallet.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dtos/change-password.dto';
dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,

    private readonly jwtService: JwtService,
  ) {}
  /*
   * Hashing Password
   * */
  private static async hashPassword(
    password: string,
    salt: string,
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
  /*
   * Compare Password
   * */
  private static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  async signUp(signUpDto: SignUpDto): Promise<any> {
    const {
      email,
      password,
      firstName,
      lastName,
      middleName,
      department,
      faculty,
      level,
      course,
      reqNumber,
    } = signUpDto;

    const saltOrRound = await bcrypt.genSalt(parseInt(process.env.GEN_SALT));

    try {
      const user = new User();
      user.firstName = firstName;
      user.password = await UserService.hashPassword(password, saltOrRound);
      user.email = email;
      user.faculty = faculty;
      user.middleName = middleName;
      user.course = course;
      user.lastName = lastName;
      user.level = level;
      user.reqNumber = reqNumber;
      user.department = department;
      const savedUser = await this.usersRepository.save(user);

      const wallet = new Wallet();
      wallet.userId = savedUser.id as any;
      wallet.walletId = new Date().getTime().toString(8);
      await this.walletRepository.save(wallet);
      return {
        message: 'Account created successfully',
        status: 'Success',
        statusCode: 201,
        data: {
          email: user.email,
          id: user.id,
        },
      };
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Email address already taken.');
      } else {
        throw new InternalServerErrorException('Something went wrong.');
      }
    }
  }

  //
  async signIn(signInDto: SignUpDto): Promise<any> {
    const { email, password } = signInDto;

    const user = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new ForbiddenException('Invalid Email or/and Password.');
    }

    const hashedPassword = user.password;
    const isMatch = await UserService.comparePassword(password, hashedPassword);
    if (!isMatch) {
      throw new ForbiddenException('Invalid Email or/and Password.');
    }

    const payload = {
      email: user.email,
      id: user.id,
    };

    const accessToken = this.jwtService.sign(payload);
    return {
      message: 'Login successfully',
      status: 'Success',
      statusCode: 200,
      accessToken,
      data: {
        email: email,
        id: user.id,
      },
    };
  }

  async findAll(): Promise<any> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<any> {
    return await this.usersRepository.findOne({ where: { id: id } });
  }

  async remove(id: number): Promise<any> {
    return await this.usersRepository.delete(id);
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: User,
  ): Promise<any> {
    const { newPassword, currentPassword } = changePasswordDto;
    const saltOrRound = await bcrypt.genSalt(parseInt(process.env['GEN_SALT']));

    const account = await this.findOne(user.id);
    if (!account) {
      throw new NotFoundException('User not found.');
    }
    const isMatch = await UserService.comparePassword(
      currentPassword,
      account.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password is not correct.');
    }

    const isSame = await UserService.comparePassword(
      newPassword,
      account.password,
    );
    if (isSame) {
      throw new BadRequestException(
        'New password cannot be the same with current password',
      );
    }

    account.password = await UserService.hashPassword(newPassword, saltOrRound);
    try {
      return await account.save();
    } catch (err) {
      throw new InternalServerErrorException('Something went wrong.');
    }
  }
}
