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
import { CreateStudentDto } from '../student/dto/create-student.dto';
import { Student } from '../student/entities/student.entity';
import readXlsxFile from 'read-excel-file/node';
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
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException();
    }
    try {
      user.firstName = firstName;
      user.lastName = lastName;
      user.middleName = middleName;
      user.email = email;
      user.course = course;
      user.faculty = faculty;
      user.level = level;
      user.reqNumber = reqNumber;
      user.department = department;
      user.isActive = true;
      user.password = await UserService.hashPassword(password, saltOrRound);
      const savedUser = await this.usersRepository.save(user);
      if (!savedUser) return;

      const wallet = new Wallet();
      wallet.userId = savedUser.id as any;
      wallet.walletId = reqNumber; //new Date().getTime().toString(8);
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

  async addStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const {
      faculty,
      department,
      email,
      firstName,
      lastName,
      middleName,
      level,
      reqNumber,
      course,
    } = createStudentDto;
    const found = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (found) {
      throw new ConflictException('email already added');
    }

    const user = await this.usersRepository.findOne({
      where: { reqNumber: reqNumber },
    });

    if (user) {
      throw new ConflictException('Student already added');
    }
    try {
      const student = new Student();
      student.faculty = faculty;
      student.email = email;
      student.department = department;
      student.firstName = firstName;
      student.lastName = lastName;
      student.middleName = middleName;
      student.level = level;
      student.reqNumber = reqNumber;
      student.course = course;
      return await this.usersRepository.save(student);
    } catch (e) {
      throw new InternalServerErrorException('An error occurred');
    }
  }

  //
  async signIn(signInDto: SignInDto): Promise<any> {
    const { regNumber, password } = signInDto;

    const user = await this.usersRepository.findOne({
      where: { reqNumber: regNumber },
    });

    if (!user) {
      throw new ForbiddenException('Invalid Email or/and Password.');
    }

    if (!user.isAdmin && !user.isActive) {
      throw new ForbiddenException('Student not active.');
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

  async uploadExcelFile(file: any, req: any): Promise<any> {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }
    const originalName = file.originalname;
    const fileExtension = originalName.split('.').pop();
    if (fileExtension !== 'xlsx') {
      throw new BadRequestException('Only xlsx File format is allowed');
    }

    const users: Array<{
      email: string;
      firstName: string;
      lastName: string;
      department: string;
      level: string;
      middleName: string;
      faculty: string;
      course: string;
      reqNumber: string;
    }> = [];

    // Handling file upload
    readXlsxFile(file.buffer)
      .then(async (rows) => {
        // skip header
        rows.shift();
        rows.forEach((row) => {
          const user: any = {
            firstName: row[0],
            lastName: row[1],
            middleName: row[2],
            email: row[3],
            level: row[4],
            reqNumber: row[5],
            department: row[6],
            course: row[7],
            faculty: row[8],
          };
          users.push(user);
        });
        // Save to db
        for (const user of users) {
          const newUser = new User();
          newUser.firstName = user.firstName;
          newUser.lastName = user.lastName;
          newUser.middleName = user.middleName;
          newUser.email = user.email;
          newUser.level = user.level;
          newUser.course = user.course;
          newUser.department = user.department;
          newUser.faculty = user.faculty;
          newUser.reqNumber = user.reqNumber;
          await this.usersRepository.save(user);
        }

        return req.status(201).json({
          message: 'Upload successfully',
          status: 'Success',
          statusCode: 201,
          data: users,
        });
      })
      .catch((err) => {
        throw new InternalServerErrorException(err.stack);
      });
  }
}
