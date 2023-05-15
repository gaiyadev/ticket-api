import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/custom-decorators/user-auth.decorator';
import { User } from '../user/entities/user.entity';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  async create(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketService.create(createTicketDto);
  }

  @Get('/book/:id')
  async findAll(@Param('id') id: number) {
    return await this.ticketService.findAll(id);
  }

  @Get('/books')
  async findAllB(@Query() id: any) {
    return await this.ticketService.findAllB(id);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.ticketService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return await this.ticketService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.ticketService.remove(id);
  }

  @Get('/app-stats/:id')
  async stats(@Param('id') id: number) {
    return await this.ticketService.stats(id);
  }

  @Get('/pay/with-card/:data')
  async payWithCard(@Param('data') data: any) {
    return await this.ticketService.payWithCard(data);
  }

  @Patch('/reschedule/:id')
  async reschedule(@Param('id') id: number, @Body() data: any) {
    return await this.ticketService.reschedule(id, data);
  }

  @Get('/ticket/validate')
  async validateTicket(@Query('id') id: string): Promise<any> {
    return await this.ticketService.validateTicket(id);
  }
}
