import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';

describe('E2E Test', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userRepository = moduleFixture.get('UserRepository');
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('User Controller', () => {
    const user1 = { name: 'KIM', email: 'test@test1.com' };
    const user2 = { name: 'LEE', email: 'test@test2.com' };

    beforeEach(async () => {
      await userRepository.save(user1);
      await userRepository.save(user2);
    });

    it('/user (GET)', () => {
      return request(app.getHttpServer())
        .get('/user')
        .expect(200)
        .expect([
          { id: 1, ...user1 },
          { id: 2, ...user2 },
        ]);
    });

    describe('Find user by id', () => {
      it('Success /user/1 (GET)', () => {
        return request(app.getHttpServer())
          .get('/user/1')
          .expect(200)
          .expect({ id: 1, ...user1 });
      });

      it('User Not Found /user/2 (GET)', () => {
        return request(app.getHttpServer())
          .get('/user/4')
          .expect(404)
          .expect({ statusCode: 404, message: 'User not found' });
      });
    });

    describe('Create user', () => {
      it('Success /user (POST)', () => {
        const newUser = { name: 'PARK', email: 'test@test3.com' };
        return request(app.getHttpServer())
          .post('/user')
          .send(newUser)
          .expect(201)
          .expect({ id: 3, ...newUser });
      });

      it('Invalid Request /user (POST)', () => {
        const newUser = { name: 'PARK' };
        return request(app.getHttpServer())
          .post('/user')
          .send(newUser)
          .expect(400)
          .expect({
            statusCode: 400,
            message: ['email should not be empty'],
            error: 'Bad Request',
          });
      });
    });

    describe('Update user', () => {
      it('Success /user/2 (PATCH)', () => {
        const updateUser = { name: 'PARK' };
        return request(app.getHttpServer())
          .patch('/user/2')
          .send(updateUser)
          .expect(200)
          .expect({ id: 2, name: 'PARK', email: 'test@test2.com' });
      });

      it('User Not Found /user/4 (PATCH)', () => {
        const updateUser = { name: 'PARK' };

        return request(app.getHttpServer())
          .patch('/user/4')
          .send(updateUser)
          .expect(404)
          .expect({ statusCode: 404, message: 'User not found' });
      });

      it('Unique Email /user/2 (PATCH)', () => {
        const updateUser = { email: 'test@test1.com' };

        return request(app.getHttpServer())
          .patch('/user/2')
          .send(updateUser)
          .expect(400)
          .expect({
            statusCode: 400,
            message: 'Email already exists',
          });
      });
    });

    describe('Delete user', () => {
      it('Success /user/2 (DELETE)', () => {
        return request(app.getHttpServer())
          .delete('/user/2')
          .expect(200)
          .expect('User 2 deleted');
      });

      it('User Not Found /user/4 (DELETE)', () => {
        return request(app.getHttpServer())
          .delete('/user/4')
          .expect(404)
          .expect({ statusCode: 404, message: 'User not found' });
      });
    });
  });
});
