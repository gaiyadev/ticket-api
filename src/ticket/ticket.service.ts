import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}
  async create(createTicketDto: CreateTicketDto, user: User) {
    const { bookId } = createTicketDto;
    try {
      const ticket = new Ticket();
      ticket.userId = user.id as any;
      ticket.bookId = bookId as any;
      return await this.ticketRepository.save(ticket);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findAll(user: User) {
    try {
      return await this.ticketRepository.find({ where: { userId: user.id } });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepository.findOne({ where: { id: id } });
    if (!ticket) {
      throw new NotFoundException();
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    const { bookId } = updateTicketDto;
    const ticket = await this.ticketRepository.findOne({ where: { id: id } });
    if (!ticket) {
      throw new NotFoundException();
    }
    try {
      ticket.bookId = bookId;
      return await this.ticketRepository.save(ticket);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    const ticket = await this.ticketRepository.delete(id);
    if (ticket.affected === 0) {
      throw new NotFoundException();
    }
    return ticket;
  }
}
