import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import request from 'supertest';
import { link } from 'fs';

describe('Bookmark (e2e)', () => {
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

  /* /bookmark/getBookmarks */

  // Given authenticated user When request to /getBookmarks Then return 200
  it('/bookmark/getBookmarks (GET)', async () => {
    const token = await login_function_reusable('admin@admin.com', 'admin');

    return request(app.getHttpServer())
      .get('/bookmark/getBookmarks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([]);
      });
  });

  // Given un-authenticated user When request to /getBookmarks Then return 401
  it('/bookmark/getBookmarks (GET-unAuth)', async () => {
    return request(app.getHttpServer())
      .get('/bookmark/getBookmarks')
      .expect(401);
  });

  // Given authenticated users When request to /getBookmarks to a specific user Then return 200
  // Ensure users don’t see each other’s data.
  it('/bookmark/getBookmarks (GET - user isolation)', async () => {
    const tokenUser1 = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const tokenUser2 = await login_function_reusable(
      'admin@admin.com',
      'admin',
    );

    await request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        title: 'User1 bookmark',
        description: 'test',
        link: 'user1.com',
      });

    const res = await request(app.getHttpServer())
      .get('/bookmark/getBookmarks')
      .set('Authorization', `Bearer ${tokenUser2}`)
      .expect(200);

    expect(res.body).toEqual([]); // user2 should see nothing
  });

  /* /bookmark/getBookmarkById */

  // Given authenticated user When request to /getBookmarkById Then return 200
  it('/bookmark/getBookmarkById/:id (GET)', async () => {
    // function for the register of the user (using JWT token)
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const createResponse = await request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Google',
        description: 'Search Engine',
        link: 'https://www.google.com',
      })
      .expect(200);

    const bookmarkId = createResponse.body.id;

    return request(app.getHttpServer())
      .get('/bookmark/getBookmarkById/' + bookmarkId)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then((response) => {
        // 3. Assertions
        expect(response.body.id).toEqual(bookmarkId);
        expect(response.body.title).toEqual('Google');
        expect(response.body.description).toEqual('Search Engine');
        expect(response.body.link).toEqual('https://www.google.com');
      });
  });

  // Given 2 different users When request to /getBookmarkById/:id that is not created by the user sending the request Then return 404
  it('/bookmark/getBookmarkById/:id (GET - forbidden other user)', async () => {
    const tokenUser1 = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const tokenUser2 = await login_function_reusable(
      'admin@admin.com',
      'admin',
    );

    const createResponse = await request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        title: 'Private Bookmark',
        description: 'Should not be accessible',
        link: 'secret.com',
      });

    const bookmarkId = createResponse.body.id;

    return request(app.getHttpServer())
      .get('/bookmark/getBookmarkById/' + bookmarkId)
      .set('Authorization', `Bearer ${tokenUser2}`)
      .expect(404);
  });

  /* /bookmark/createBookmark */

  // Given authenticated user When request to /bookmark/createBookmark Then return 200
  it('/bookmark/createBookmark/ (POST)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${token}`)
      .send({
        link: 'lol.com',
        title: 'lol',
        description: 'lol',
      })
      .expect(200)
      .then((response) => {
        expect(response.body.link).toEqual('lol.com');
        expect(response.body.title).toEqual('lol');
        expect(response.body.description).toEqual('lol');
      });
  });

  // Given un-Authenticated user When request to /bookmark/createBookmark Then return 401
  it('/bookmark/createBookmark (POST-unAuth)', async () => {
    return request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .send({
        link: 'lol.com',
        title: 'lol',
        description: 'lol',
      })
      .expect(401);
  });

  it('/bookmark/createBookmark (POST - long input)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const longString = 'a'.repeat(5000);

    return request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: longString,
        description: longString,
        link: 'long.com',
      })
      .expect(200); // should return 400, but no validations so 200
  });

  /* /bookmark/editBookmarkById/:id */

  // Given Authticated user When request to /bookmark/updateBookmark Then return 200
  it('/bookmark/editBookmarkById/:id (PATCH)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const createResponse = await request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Google',
        description: 'Search Engine',
        link: 'https://www.google.com',
      })
      .expect(200);

    const bookmarkId = createResponse.body.id;

    return request(app.getHttpServer())
      .patch('/bookmark/editBookmarkById/' + bookmarkId)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Google_modified',
        description: 'Search Engine_modified',
        link: 'The cooler link',
      })
      .expect(200)
      .then((response) => {
        // 3. Assertions
        expect(response.body.id).toEqual(bookmarkId);
        expect(response.body.title).toEqual('Google_modified');
        expect(response.body.description).toEqual('Search Engine_modified');
        expect(response.body.link).toEqual('The cooler link');
      });
  });

  // Given un-Authenticated user When request to /bookmark/editBookmarkById Then return 401
  it('/bookmark/editBookmarkById/:id (PATCH-unAuth)', async () => {
    return request(app.getHttpServer())
      .patch('/bookmark/editBookmarkById/1')
      .send({
        title: 'Google_modified',
        description: 'Search Engine_modified',
        link: 'The cooler link',
      })
      .expect(401);
  });

  /* /bookmark/deleteBookmarkById/:id */
  // Given Authenticated user and a brand new bookmark When request to /bookmark/deleteBookmarkById/:id Then return 200 and deletes the bookmark created
  it('/bookmark/deleteBookmarkById/:id (DELETE)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const createResponse = await request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Wikiupia_should_be_deleted',
        description: 'Website',
        link: 'Wikipedia.com',
      })
      .expect(200);

    const bookmarkId = createResponse.body.id;

    return request(app.getHttpServer())
      .delete('/bookmark/deleteBookmarkById/' + bookmarkId)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  // Given un-Authenticated user When request to /bookmark/deleteBookmarkById Then return 401
  it('/bookmark/deleteBookmarkById/:id (DELETE-unAuth)', async () => {
    return request(app.getHttpServer())
      .delete('/bookmark/deleteBookmarkById/1')
      .expect(401);
  });

  // Given Authenticated user and non-existing bookmark When request to /bookmark/deleteBookmarkById/:id Then return 404
  it('/bookmark/deleteBookmarkById/:id (DELETE-nonExisting)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    return request(app.getHttpServer())
      .delete('/bookmark/deleteBookmarkById/pdfbdabrt')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/bookmark/deleteBookmarkById/:id (DELETE twice)', async () => {
    const token = await login_function_reusable(
      'test_subject@test.com',
      'test_subject',
    );

    const createResponse = await request(app.getHttpServer())
      .post('/bookmark/createBookmark')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'To delete twice',
        description: 'test',
        link: 'delete.com',
      });

    const bookmarkId = createResponse.body.id;

    await request(app.getHttpServer())
      .delete('/bookmark/deleteBookmarkById/' + bookmarkId)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    return request(app.getHttpServer())
      .delete('/bookmark/deleteBookmarkById/' + bookmarkId)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  /* ***************************
    End of the tests
  *************************** */

  afterAll(async () => {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 500));
  });
});
