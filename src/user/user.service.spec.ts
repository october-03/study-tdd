import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

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
      providers: [UserService],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create User', () => {
    it('should create a user', async () => {
      const user: CreateUserDto = { name: 'KIM', email: 'test1@test.com' };
      const result = await service.create(user);
      expect(result).toEqual({ id: 1, ...user });
    });

    it('should duplicated user', async () => {
      const user: CreateUserDto = { name: 'KIM', email: 'test1@test.com' };
      await service.create(user);
      try {
        await service.create(user);
      } catch (e) {
        expect(e.status).toEqual(400);
        expect(e.message).toEqual('User already exists');
      }
    });

    it('should return a bad request', async () => {
      jest.spyOn(userRepository, 'save').mockImplementation(() => {
        throw new Error('Bad request');
      });

      try {
        await service.create({ name: 'KIM', email: 'test1@test.com' });
      } catch (e) {
        expect(e.status).toEqual(500);
        expect(e.message).toEqual('Bad request');
      }
    });
  });

  describe('Find User', () => {
    const user1 = { name: 'KIM', email: 'test1@test.com' };
    const user2 = { name: 'LEE', email: 'test2@test.com' };

    beforeEach(async () => {
      await service.create(user1);
      await service.create(user2);
    });

    it('should return all users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        { id: 1, ...user1 },
        { id: 2, ...user2 },
      ]);
    });

    it('should return a bad request', async () => {
      jest.spyOn(userRepository, 'find').mockImplementation(() => {
        throw new Error('Bad request');
      });

      try {
        await service.findAll();
      } catch (e) {
        expect(e.status).toEqual(500);
        expect(e.message).toEqual('Bad request');
      }
    });

    it('should return a user', async () => {
      const result = await service.findOne(2);
      expect(result).toEqual({ id: 2, ...user2 });
    });

    it('should return a user not found', async () => {
      try {
        await service.findOne(3);
      } catch (e) {
        expect(e.status).toEqual(404);
        expect(e.message).toEqual('User not found');
      }
    });

    it('should return a bad request', async () => {
      jest.spyOn(userRepository, 'findOne').mockImplementation(() => {
        throw new Error('Bad request');
      });

      try {
        await service.findOne(2);
      } catch (e) {
        expect(e.status).toEqual(500);
        expect(e.message).toEqual('Bad request');
      }
    });
  });

  describe('Update User', () => {
    const user1 = { name: 'KIM', email: 'test1@test.com' };
    const user2 = { name: 'LEE', email: 'test2@test.com' };

    beforeEach(async () => {
      await service.create(user1);
      await service.create(user2);
    });

    it('should update a user', async () => {
      const result = await service.update(2, { name: 'PARK' });
      expect(result).toEqual({ id: 2, name: 'PARK', email: 'test2@test.com' });
    });

    it('should return a user not found', async () => {
      try {
        await service.update(3, { name: 'PARK' });
      } catch (e) {
        expect(e.status).toEqual(404);
        expect(e.message).toEqual('User not found');
      }
    });

    it('should return a duplicated email', async () => {
      try {
        await service.update(2, { email: 'test1@test.com' });
      } catch (e) {
        expect(e.status).toEqual(400);
        expect(e.message).toEqual('Email already exists');
      }
    });

    it('should return a bad request', async () => {
      jest.spyOn(userRepository, 'update').mockImplementation(() => {
        throw new Error('Bad request');
      });

      try {
        await service.update(2, { name: 'PARK' });
      } catch (e) {
        expect(e.status).toEqual(500);
        expect(e.message).toEqual('Bad request');
      }
    });
  });

  describe('Delete User', () => {
    const user1 = { name: 'KIM', email: 'test1@test.com' };
    const user2 = { name: 'LEE', email: 'test2@test.com' };

    beforeEach(async () => {
      await service.create(user1);
      await service.create(user2);
    });

    it('should delete a user', async () => {
      const result = await service.remove(2);
      expect(result).toEqual('User 2 deleted');
    });

    it('should return a user not found', async () => {
      try {
        await service.remove(3);
      } catch (e) {
        expect(e.status).toEqual(404);
        expect(e.message).toEqual('User not found');
      }
    });

    it('should return a bad request', async () => {
      jest.spyOn(userRepository, 'delete').mockImplementation(() => {
        throw new Error('Bad request');
      });

      try {
        await service.remove(2);
      } catch (e) {
        expect(e.status).toEqual(500);
        expect(e.message).toEqual('Bad request');
      }
    });
  });
});
