import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  bookId: number;

  @Column()
  seat_number: number;

  @Column()
  amount: number;

  @Column()
  uniqueId: string;

  @ManyToOne(() => User, (user) => user.tickets, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Book, (books) => books.ticket, {
    eager: true,
    onDelete: 'CASCADE',
  })
  book: Book[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
