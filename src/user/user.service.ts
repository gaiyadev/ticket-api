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
import { SignInDto } from './dtos/sign-in.dto';
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
      user.lastName = lastName;
      user.middleName = middleName;
      user.email = email;
      user.course = course;
      user.faculty = faculty;
      user.level = level;
      user.reqNumber = reqNumber;
      user.department = department;
      user.password = await UserService.hashPassword(password, saltOrRound);
      const savedUser = await this.usersRepository.save(user);
      if (!savedUser) return;

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
          admin: user.isAdmin,
        },
      };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Email address and/or reg number already taken.',
        );
      } else {
        throw new InternalServerErrorException('Something went wrong.');
      }
    }
  }

  //
  async signIn(signInDto: SignInDto): Promise<any> {
    const { regNumber, password } = signInDto;

    const user = await this.usersRepository.findOne({
      where: { reqNumber: regNumber },
    });
    console.log(user);

    if (!user) {
      throw new ForbiddenException('Invalid Email or/and Password.');
    }
    const hashedPassword = user.password;
    const isMatch = await UserService.comparePassword(password, hashedPassword);
    if (!isMatch) {
      throw new ForbiddenException('Invalid Email or/and Password.');
    }

    const payload = {
      reqNumber: user.reqNumber,
      id: user.id,
    };

    const accessToken = this.jwtService.sign(payload);
    return {
      message: 'Login successfully',
      status: 'Success',
      statusCode: 200,
      accessToken,
      data: {
        reqNumber: regNumber,
        id: user.id,
        isAdmin: user.isAdmin,
        email: user.email,
      },
    };
  }

  async findAll(): Promise<any> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
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

  async createAdmin(signUpDto: SignUpDto): Promise<any> {
    const { email, password, firstName, lastName, middleName } = signUpDto;

    const saltOrRound = await bcrypt.genSalt(parseInt(process.env.GEN_SALT));

    try {
      const user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.middleName = middleName;
      user.email = email;
      user.reqNumber = email;
      user.isAdmin = true;
      user.password = await UserService.hashPassword(password, saltOrRound);
      return await this.usersRepository.save(user);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Email address and/or reg number already taken.',
        );
      } else {
        throw new InternalServerErrorException('Something went wrong.');
      }
    }
  }

  async StudentsCount() {
    return await this.usersRepository.findAndCount();
  }
}
