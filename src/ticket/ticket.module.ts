import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Wallet, Transaction, User])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
