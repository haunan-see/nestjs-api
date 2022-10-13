import { EditBookmarkDto } from './../src/bookmark/dto/edit-bookmark.dto';
import { CreateBookmarkDto } from './../src/bookmark/dto/create-bookmark.dto';
import { AuthDto } from './../src/auth/dto/auth.dto';
import { PrismaService } from './../src/prisma/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    baseUrl = 'http://localhost:3333';

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: '123',
    };

    describe('Sign-up', () => {
      it('should throw if no dto is provided', () => {
        return pactum.spec().post(`${baseUrl}/auth/sign-up`).expectStatus(400);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/sign-up`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/sign-up`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should sign-up', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/sign-up`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Sign-in', () => {
      it('should throw if no dto is provided', () => {
        return pactum.spec().post(`${baseUrl}/auth/sign-in`).expectStatus(400);
      });

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/sign-in`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/sign-in`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should sign-in', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/auth/sign-in`)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get User', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/users/test`)
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .expectStatus(200);
      });
    });
    describe('Edit User', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          email: 'test_test@test.com',
          firstName: 'Hau Nan',
          lastName: 'See',
        };

        return pactum
          .spec()
          .patch(`${baseUrl}/users`)
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/bookmarks`)
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://google.com',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(`${baseUrl}/bookmarks`)
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/bookmarks`)
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'WAKANDA FOREVER',
        description: 'asdasdasdasda',
      };

      it('edit bookmark by id', () => {
        return pactum
          .spec()
          .patch(`${baseUrl}/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title);
      });
    });

    describe('Delete bookmark by id', () => {
      it('delete bookmark by id', () => {
        return pactum
          .spec()
          .delete(`${baseUrl}/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/bookmarks`)
          .withHeaders('Authorization', 'Bearer $S{userAccessToken}')
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
