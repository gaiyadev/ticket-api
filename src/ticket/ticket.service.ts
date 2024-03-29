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
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
import { TransactionType } from '../wallet/interfaces/transaction-type.interface';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      ticket.uniqueId = `BUK/${new Date().getFullYear()}/${Math.random()
        .toString(36)
        .slice(-5)}`;
      const book = await this.ticketRepository.save(ticket);
      if (!book) {
        throw new InternalServerErrorException();
      }
      const balance = Number(wallet.balance);
      wallet.balance = Number(balance) - Number(amount);
      await this.walletRepository.save(wallet);
      await this.createTransaction({
        amount: amount,
        transactionType: TransactionType.Payment,
        wallet,
      });
      return book;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async findAll(id: number) {
    try {
      return await this.ticketRepository.find({
        where: { userId: id },
        order: { id: 'DESC' },
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async findAllB(id: string) {
    try {
      return await this.ticketRepository.find({
        relations: ['user'],
        order: { id: 'DESC' },
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket Not found');
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

  async createTransaction({ transactionType, wallet, amount }) {
    const transaction = new Transaction();
    transaction.transactionType = transactionType;
    transaction.amount = amount;
    transaction.balanceBefore = Number(wallet.balance);
    transaction.balanceAfter = Number(wallet.balance) + Number(amount);
    transaction.walletId = wallet.id;
    return await this.transactionRepository.save(transaction);
  }

  async stats(id: number) {
    const wallet = await this.walletRepository.findOne({
      where: { userId: id },
    });
    const ticket = await this.ticketRepository.find({
      where: { userId: id },
    });
    const data = await Promise.all([wallet, ticket]);
    return {
      walletBalance: data[0]?.balance,
      ticketBook: data[1]?.length,
    };
  }

  async payWithCard(data: any) {
    const dto = JSON.parse(data);
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
      relations: ['wallet'],
    });

    if (!user) {
      throw new NotFoundException();
    }
    try {
      const ticket = new Ticket();
      ticket.userId = dto.userId as any;
      ticket.bookId = dto.bookId as any;
      ticket.amount = parseInt(dto.amount);
      ticket.seat_number = dto.seatNumber;
      ticket.uniqueId = `BUK/${new Date().getFullYear()}/${Math.random()
        .toString(36)
        .slice(-5)}`;
      const book = await this.ticketRepository.save(ticket);
      if (!book) {
        throw new InternalServerErrorException();
      }
      const wallet = await this.walletRepository.findOne({
        where: { userId: dto.userId },
      });
      await this.createTransaction({
        amount: dto.amount,
        transactionType: TransactionType.CardPayment,
        wallet,
      });
      return book;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async reschedule(id: number, data: any) {
    const booking = await this.ticketRepository.findOne({ where: { id: id } });

    if (!booking) {
      throw new NotFoundException();
    }

    return booking;
  }

  async validateTicket(id: string): Promise<any> {
    const ticket = await this.ticketRepository.findOne({
      where: { uniqueId: id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket Not valid');
    }

    return ticket;
  }
}
