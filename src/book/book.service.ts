import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    return await this.bookRepository.save(createBookDto);
  }

  async findAll() {
    return this.bookRepository.find();
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOne({ where: { id: id } });
    if (!book) {
      throw new NotFoundException();
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const { from, to, time } = updateBookDto;
    const book = await this.bookRepository.findOne({ where: { id: id } });
    if (!book) {
      throw new NotFoundException();
    }
    try {
      book.to = to;
      book.time = time;
      book.from = from;
      return this.bookRepository.save(book);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    const book = await this.bookRepository.delete(id);
    if (book.affected === 0) {
      throw new NotFoundException();
    }
    return book;
  }
}
