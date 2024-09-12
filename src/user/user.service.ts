import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const currentUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (currentUser) {
        throw new HttpException('User already exists', 400);
      }

      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (e) {
      throw new HttpException(e.message, e.status || 500);
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find();
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      return user;
    } catch (e) {
      throw new HttpException(e.message, e.status || 500);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      await this.userRepository.update(id, updateUserDto);
      return await this.userRepository.findOne({ where: { id } });
    } catch (e) {
      if (e instanceof QueryFailedError) {
        const errMessage = (e as any).message;

        if (errMessage.includes('duplicate') || errMessage.includes('UNIQUE')) {
          if (errMessage.includes('email')) {
            throw new HttpException('Email already exists', 400);
          }
        }
      }
      throw new HttpException(e.message, e.status || 500);
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', 404);
      }

      await this.userRepository.delete(id);
      return `User ${id} deleted`;
    } catch (e) {
      throw new HttpException(e.message, e.status || 500);
    }
  }
}
