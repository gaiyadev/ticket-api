import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { GetUser } from '../user/custom-decorators/user-auth.decorator';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { WalletTransferFund } from './dto/transfer-fund.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
  }

  @Get('/')
  async findAll(): Promise<any> {
    return await this.walletService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.walletService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(+id, updateWalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(+id);
  }

  @Get('/verify-payment/:reference/:id')
  @HttpCode(HttpStatus.CREATED)
  async addFund(@Param('reference') reference: string, @Param() id: number) {
    return await this.walletService.addFund(reference, id);
  }

  @Post('/wallet-transfer')
  @UseGuards(AuthGuard('user'))
  @UsePipes(ValidationPipe)
  async walletTransferFund(
    @Body() transferFund: WalletTransferFund,
    @GetUser() user: User,
  ): Promise<any> {
    return await this.walletService.walletTransferFund(transferFund, user);
  }
}
