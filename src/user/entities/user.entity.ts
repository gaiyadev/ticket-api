import {
  Column,
  CreateDateColumn,
  Entity, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Wallet } from "../../wallet/entities/wallet.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  faculty: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    eager: true,
    onDelete: 'CASCADE',
  })
  wallet: Wallet;

  @Column({ nullable: true })
  course: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: false, default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
