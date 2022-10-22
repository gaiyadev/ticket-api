import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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

  async createTransaction({
    transactionType,
    wallet,
    reference,
    paidAmount,
    metaData,
  }) {
    const transaction = new Transaction();
    transaction.transactionType = transactionType;
    transaction.transactionType = transactionType;
    transaction.amount = paidAmount;
    transaction.balanceBefore = Number(wallet.balance);
    transaction.balanceAfter = Number(wallet.balance) + paidAmount;
    // transaction.walletId = wallet.id as any;
    transaction.transactionReference = reference;
    return await this.transactionRepository.save(transaction);
  }

  // Add fund
  async addFund(reference: string, id: number) {
    const wallet = await this.walletRepository.findOne({
      where: { userId: id },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found'!);
    }
    const verify = await this.verifyPayment(reference);
    if (verify.data.status === 'success') {
      const paidAmount = Number(verify.data.amount) / 100;
      wallet.balance = (Number(wallet.balance) + paidAmount) as any;
      await this.walletRepository.save(wallet);

      await this.createTransaction({
        paidAmount: paidAmount,
        metaData: verify.data.authorization,
        reference: verify.data.reference,
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
  }

  //transfer fund
  async walletTransferFund(
    transferFund: WalletTransferFund,
    user: User,
  ): Promise<any> {
    const { accountId, amount } = transferFund;

    const wallet = await this.getWallet(user.id);
    if (!wallet) {
      throw new NotFoundException();
    }

    const account = await this.walletRepository.findOne({
      where: { walletId: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (amount < wallet.balance) {
      throw new ForbiddenException('Insufficient found');
    }

    // Debiting the sender
    wallet.balance = (Number(wallet.balance) - Number(amount)) as any;
    await this.walletRepository.save(wallet);

    // Crediting the recipient
    const paidAmount = Number(amount);
    account.balance = (Number(account.balance) + paidAmount) as any;
    await this.walletRepository.save(wallet);

    await this.createTransaction({
      paidAmount: transferFund.amount,
      reference: account.walletId,
      transactionType: TransactionType.Transfer,
      wallet,
      metaData: null,
    });
    return {
      message: 'Charge successfully',
      status: 'Success',
      statusCode: 201,
      data: wallet.balance,
    };
  }
}
