import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
dotenv.config();

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new UnauthorizedException('Unauthorized Access.78');
    }
    return user;
  }
}
