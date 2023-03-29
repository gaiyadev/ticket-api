import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { TransactionType } from '../interfaces/transaction-type.interface';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  walletId: number;

  @Column({
    nullable: false,
    type: 'varchar',
    name: 'transaction_reference',
    unique: false,
  })
  transactionReference: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type',
  })
  transactionType: TransactionType;

  @Column({ nullable: false, type: 'decimal' })
  amount: number;

  @Column({ nullable: false, type: 'decimal', name: 'balance_before' })
  balanceBefore: number;

  @Column({ nullable: false, type: 'decimal', name: 'balance_after' })
  balanceAfter: number;

  @ManyToOne(() => Wallet, (wallets) => wallets.transactions, {
    onDelete: 'CASCADE',
  })
  wallet: Wallet;

  @Column({ nullable: true })
  metaData: string;

  @Column({ name: 'external_reference', type: 'varchar' })
  externalReference: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
