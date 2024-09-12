import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create User', () => {
    it('should create a user', async () => {
      const user: CreateUserDto = { name: 'KIM', email: 'test1@test.com' };
      const result = await controller.create(user);
      expect(result).toEqual({ id: 1, ...user });
    });

    it('should duplicated user', async () => {
      const user: CreateUserDto = { name: 'KIM', email: 'test1@test.com' };
      await controller.create(user);
      try {
        await controller.create(user);
      } catch (e) {
        expect(e.status).toEqual(400);
        expect(e.message).toEqual('User already exists');
      }
    });
  });

  describe('Find User', () => {
    const user1 = { name: 'KIM', email: 'test1@test.com' };
    const user2 = { name: 'LEE', email: 'test2@test.com' };

    beforeEach(async () => {
      await controller.create(user1);
      await controller.create(user2);
    });

    it('should return all users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        { id: 1, ...user1 },
        { id: 2, ...user2 },
      ]);
    });

    it('should return a user', async () => {
      const result = await controller.findOne('2');
      expect(result).toEqual({ id: 2, ...user2 });
    });

    it('should return a user not found', async () => {
      try {
        await controller.findOne('3');
      } catch (e) {
        expect(e.status).toEqual(404);
        expect(e.message).toEqual('User not found');
      }
    });
  });

  describe('Update User', () => {
    const user1 = { name: 'KIM', email: 'test1@test.com' };
    const user2 = { name: 'LEE', email: 'test2@test.com' };

    beforeEach(async () => {
      await controller.create(user1);
      await controller.create(user2);
    });

    it('should update a user', async () => {
      const result = await controller.update('2', { name: 'PARK' });
      expect(result).toEqual({ id: 2, name: 'PARK', email: 'test2@test.com' });
    });

    it('should return a user not found', async () => {
      try {
        await controller.update('3', { name: 'PARK' });
      } catch (e) {
        expect(e.status).toEqual(404);
        expect(e.message).toEqual('User not found');
      }
    });

    it('should return a duplicated email', async () => {
      try {
        await controller.update('2', { email: 'test1@test.com' });
      } catch (e) {
        expect(e.status).toEqual(400);
        expect(e.message).toEqual('Email already exists');
      }
    });
  });

  describe('Delete User', () => {
    const user1 = { name: 'KIM', email: 'test1@test.com' };
    const user2 = { name: 'LEE', email: 'test2@test.com' };

    beforeEach(async () => {
      await controller.create(user1);
      await controller.create(user2);
    });

    it('should delete a user', async () => {
      const result = await controller.remove('2');
      expect(result).toEqual('User 2 deleted');
    });

    it('should return a user not found', async () => {
      try {
        await controller.remove('3');
      } catch (e) {
        expect(e.status).toEqual(404);
        expect(e.message).toEqual('User not found');
      }
    });
  });
});
