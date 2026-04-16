import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import request from 'supertest';

describe('User (e2e)', () => {
  let app: INestApplication;

  // function for the register of the user (using JWT token)
  const login_function_reusable = async (
    email: string,
    password: string,
  ): Promise<string> => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: email,
        password: password,
      });

    const token = loginResponse.body.access_token;

    return token;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  /* ***************************
    Begining of the tests
  *************************** */
  // Given un-authenticated user When request to /users/me Then return 401
  it('/user/me (GET - no token)', async () => {
    return request(app.getHttpServer()).get('/user/me').expect(401);
  });

  // Given un-authenticated user When request to /users/me Then return 401
  it('/user/me (GET - invalid token)', async () => {
    return request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });

  //  Given Authticated user When request to /users/me Then return 200
  it('/user/me (GET)', async () => {
    // user has to log in to get the jwt token
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });

  /* /user/update */

  // Given Authticated user and an updated firstname/lastname When request to /user/update Then return 200
  it('/user/update (PATCH)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({
        firstname: 'John',
        lastname: 'Doe',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.firstname).toEqual('John');
        expect(response.body.lastname).toEqual('Doe');
      });
  });

  // Given Authenticated user an updated firstanme and absent lastname When request to /user/update Then return 200
  it('/user/update (PATCH)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({
        firstname: 'Test_changement_firstname',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.firstname).toEqual('Test_changement_firstname');
        expect(response.body.lastname).toEqual('Doe');
      });
  });

  // Given un-authenticated user When request to /user/update Then return 401
  it('/user/update (PATCH)', async () => {
    return request(app.getHttpServer())
      .patch('/user/update')
      .send({
        firstname: 'John',
        lastname: 'Doe',
      })
      .expect(401);
  });

  // Given Authenticated user and empty body When request to /user/update Then return 200
  it('/user/update (PATCH - empty body)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({})
      .expect(200); // or 400 depending on your DTO rules
  });

  // Given Authenticated user and an updated email When request to /user/update Then return 400
  it('/user/update (PATCH - cannot update email)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({
        email: 'hacker@hack.com',
      })
      .expect(400)
      .then((res) => {
        expect(res.body.message).toEqual(['property email should not exist']);
      });
  });

  // Given Authenticated user When trying to update his email to verify he can't update it Then reurn 403
  it('/user/update (PATCH - cannot update email and checks it after)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    await request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({
        email: 'test_subject@test.com',
      })
      .expect(400);

    const res = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);

    return expect(res.body.email).toBe('test_subject@test.com');
  });

  // Given Authenticated user When trying to update his id Then reurn 400
  it('/user/update (PATCH - cannot update id)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({ id: '09145' })
      .expect(400);
  });

  // Give Authenicated user and unknown field in request When trying to modify his profile Then return 400
  it('/user/update (PATCH - cannot update unknown field)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .patch('/user/update')
      .set('Authorization', 'Bearer ' + token)
      .send({ unknown_filed: 'unknown' })
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});
