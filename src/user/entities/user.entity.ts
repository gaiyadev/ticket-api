import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { JoinColumn } from 'typeorm/browser';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true, unique: true })
  reqNumber: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  faculty: string;

  @OneToMany(() => Wallet, (wallet) => wallet.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  wallet: Wallet;

  @OneToMany(() => Ticket, (tickets) => tickets.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  tickets: Ticket[];

  @Column({ nullable: true })
  course: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: false, default: false })
  isAdmin: boolean;

  @Column({ nullable: false, default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
