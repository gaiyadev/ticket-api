import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
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
    const found = await this.studentRepository.findOne({
      where: { email: email },
    });

    if (found) {
      throw new ConflictException('email already added');
    }

    const req = await this.studentRepository.findOne({
      where: { reqNumber: reqNumber },
    });

    if (req) {
      throw new ConflictException('regnumber already added');
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
      return await this.studentRepository.save(student);
    } catch (e) {
      throw new InternalServerErrorException('An error occurred');
    }
  }

  async findAll() {
    return await this.userRepository.find({ order: { id: 'DESC' } });
  }

  async findStudent(id: number) {
    const student = await this.userRepository.findOne({ where: { id: id } });
    if (!student) {
      throw new NotFoundException();
    }
    return student;
  }

  async findOne(id: any) {
    const student = await this.userRepository.findOne({
      where: { reqNumber: id.student },
    });

    if (!student) {
      throw new NotFoundException('Reg. Number not found');
    }
    if (student.isActive === true) {
      throw new ConflictException('Student already registered');
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
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
    } = updateStudentDto;

    const found = await this.studentRepository.findOne({
      where: { id: id },
    });

    if (!found) {
      throw new NotFoundException();
    }
    try {
      found.faculty = faculty;
      found.email = email;
      found.department = department;
      found.firstName = firstName;
      found.lastName = lastName;
      found.middleName = middleName;
      found.level = level;
      found.reqNumber = reqNumber;
      found.course = course;
      return await this.studentRepository.save(found);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('req number or email already exist');
      }
      throw new InternalServerErrorException('An error occurred');
    }
  }

  async remove(id: number) {
    const student = await this.userRepository.delete(id);
    if (student.affected === 0) {
      throw new NotFoundException();
    }
    return student;
  }

  async StudentsCount() {
    return await this.studentRepository.findAndCount();
  }
}
