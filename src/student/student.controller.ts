import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  async create(@Body() createStudentDto: CreateStudentDto): Promise<any> {
    return await this.studentService.create(createStudentDto);
  }

  @Get('/')
  async findAll() {
    return this.studentService.findAll();
  }

  @Get('/user/:id')
  async findStudent(@Param('id') id: string) {
    return this.studentService.findStudent(+id);
  }

  @Get('/student')
  async findOne(@Query(ValidationPipe) id: any) {
    return await this.studentService.findOne(id);
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.studentService.remove(+id);
  }

  @Get('/counts')
  async StudentsCount() {
    return await this.studentService.StudentsCount();
  }
}
