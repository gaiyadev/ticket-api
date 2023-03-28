import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../../user/entities/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ nullable: true, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'varchar', name: 'wallet_id' })
  walletId: string;

  @Column({ nullable: false, type: 'decimal', default: 0 })
  balance: number;

  @ManyToOne(() => User, (user) => user.wallet, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Transaction, (transactions) => transactions.wallet, {
    eager: true,
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
