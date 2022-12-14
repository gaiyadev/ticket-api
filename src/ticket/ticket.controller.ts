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
  @UseGuards(AuthGuard('user'))
  @UsePipes(ValidationPipe)
  async create(
    @Body() createTicketDto: CreateTicketDto,
    @GetUser() user: User,
  ) {
    return await this.ticketService.create(createTicketDto, user);
  }

  @Get('/')
  @UseGuards(AuthGuard('user'))
  async findAll(@GetUser() user: User) {
    return await this.ticketService.findAll(user);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.ticketService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return await this.ticketService.update(+id, updateTicketDto);
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
    return  await this.ticketService.remove(+id);
  }
}
