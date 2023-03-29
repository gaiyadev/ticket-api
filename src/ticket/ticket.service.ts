import {
  BadRequestException,
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
import { Wallet } from '../wallet/entities/wallet.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const { bookId, userId, amount, seatNumber } = createTicketDto;
    const wallet = await this.walletRepository.findOne({
      where: { userId: userId },
    });

    if (Number(wallet.balance) < Number(amount)) {
      throw new BadRequestException('insufficient fund');
    }

    try {
      const ticket = new Ticket();
      ticket.userId = userId as any;
      ticket.bookId = bookId as any;
      ticket.amount = amount;
      ticket.seat_number = seatNumber;
      ticket.uniqueId = `BUK/${new Date().getFullYear()} /${userId}_${bookId}.${amount}`;
      const book = await this.ticketRepository.save(ticket);
      if (!book) {
        throw new InternalServerErrorException();
      }
      const balance = Number(wallet.balance);
      wallet.balance = Number(balance) - Number(amount);
      await this.walletRepository.save(wallet);
      return book;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findAll(id: number) {
    try {
      return await this.ticketRepository.find({ where: { userId: id } });
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

  async remove(id: number): Promise<any> {
    const ticket = await this.ticketRepository.delete(id);
    console.log(ticket);
    if (ticket.affected === 0) {
      throw new NotFoundException('Not found');
    }
    return ticket;
  }
}
