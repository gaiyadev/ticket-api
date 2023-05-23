import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './interfaces/transaction-type.interface';
import { WalletTransferFund } from './dto/transfer-fund.dto';
import { User } from '../user/entities/user.entity';
import axios from 'axios';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  create(createWalletDto: CreateWalletDto) {
    return 'This action adds a new wallet';
  }

  async findAll(): Promise<any> {
    return await this.walletRepository.find();
  }

  async getWallet(id: number): Promise<any> {
    const found = await this.walletRepository.findOne({
      where: { userId: id },
    });
    //30402420666057 to //30236024100747
    if (!found) {
      throw new NotFoundException('Wallet not found');
    }
    return found;
  }

  async findOne(id: number): Promise<any> {
    return await this.getWallet(id);
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }

  async verifyPayment(reference: string) {
    const verifyTransaction = await axios.get(
      `${process.env['PAYSTACK_BASE_URL']}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env['PAYSTACK_SECRET_KEY']}`,
        },
      },
    );
    if (verifyTransaction.status === 200) {
      return verifyTransaction.data;
    }
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

  // Add fund
  async addFund(userId: any, amount: any) {
    console.log('values', userId, amount);
    const wallet = await this.walletRepository.findOne({
      where: { userId: userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    wallet.balance = Number(wallet.balance) + Number(amount);
    const success = await this.walletRepository.save(wallet);
    if (!success) throw new ForbiddenException();
    await this.createTransaction({
      amount: amount,
      transactionType: TransactionType.funding,
      wallet,
    });
    return {
      message: 'Wallet Funded successfully',
      balance: wallet.balance,
      status: 'Success',
      statusCode: 201,
    };
  }

  //transfer fund
  async walletTransferFund(transferFund: WalletTransferFund): Promise<any> {
    const { accountId, amount, userId } = transferFund;

    const wallet = await this.walletRepository.findOne({
      where: { userId: userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // recipient details
    const account = await this.walletRepository.findOne({
      where: { walletId: accountId },
    });

    if (!account) {
      throw new BadRequestException('Recipient accountId not found');
    }

    if (wallet.walletId === accountId) {
      throw new BadRequestException('Cannot send money to self');
    }

    if (parseInt(amount) > parseInt(String(wallet.balance))) {
      throw new ForbiddenException('Insufficient found');
    }

    // Debiting the sender
    wallet.balance = parseInt(String(wallet.balance)) - parseInt(amount);
    await this.walletRepository.save(wallet);

    // Crediting the recipient
    account.balance = parseInt(String(account.balance)) + parseInt(amount);
    await this.walletRepository.save(account);

    await this.createTransaction({
      amount: transferFund.amount,
      transactionType: TransactionType.Transfer,
      wallet,
    });

    return {
      message: 'Transferred successfully',
      status: 'Success',
      statusCode: 201,
      data: wallet.balance,
    };
  }

  async transactions(walletId: number) {
    try {
      return await this.transactionRepository.find({
        where: { walletId: walletId },
        order: { id: 'DESC' },
      });
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
