import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  /** auth/checkToken */
  // Given authenticated user but expired token When request to /auth/checkToken Then return 401
  // it('/auth/checkToken (GET - expired token)', async () => {
  //   return request(app.getHttpServer())
  //     .get('/auth/checkToken')
  //     .set(
  //       'Authorization',
  //       'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token',
  //     )
  //     .expect(401);
  // });

  /* Auth/signup */

  // Given valid inputs When request to /auth/signup Then return 201

  it('/auth/signup (POST)', async () => {
    const email = '7Vt7I_testing_subject@example.com';

    try {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password: '7Vt7I1234', // FIX: trop court avant
        })
        .expect(200);

    } finally {
      await prisma.user.deleteMany({
        where: { email },
      });
    }
  });

  // Given already created user When request to /auth/signup Then return 403
  it('/auth/signup (POST - already created user)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: '7Vt7I@example.com',
        password: '7Vt7I1234',
      })
      .expect(403);
  });

  // Given missing field password When request to /auth/signup Then return 400
  it('/auth/signup (POST - missing fields)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test@test.com',
      })
      .expect(400);
  });

  // Given invalid email When request to /auth/signup Then return 400
  it('/auth/signup (POST - invalid email)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'not-an-email',
        password: 'validpassword1234',
      })
      .expect(400);
  });

  // Given invalid password When request to /auth/signup Then return 403
  it('/auth/signin (POST - wrong password)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test_subject@test.com',
        password: 'wrongpassword',
      })
      .expect(403);
  });

  /* Auth/signin */

  // Given valid user When request to /auth/signin Then return 200
  it('/auth/signin (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test_subject@test.com',
        password: 'test_subject',
      })
      .expect(200);
  });

  // Given invalid user When request to /auth/signin Then return 403
  it('/auth/signin (POST - user not found)', async () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'someone_not_there@example.com',
        password: 'someone_not_there',
      })
      .expect(403);
  });

  /* Auth/profile */

  // Given invalid route When request to /auth/profiles Then return 404
  it('/auth/profiles (GET)', async () => {
    return request(app.getHttpServer())
      .get('/auth/profiles')
      .expect(404);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: '7Vt7I_testing_subject@example.com' },
    });

    await app.close();

    // FIX: évite les workers bloqués (E2E leak fix)
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});