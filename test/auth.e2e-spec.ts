import { perBuild, sequence, build, fake } from '@jackfranklin/test-data-bot';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';

import { AppModule } from '../src/app.module';
import { setup } from '../src/setup';

const createDeliveryBuilder = build({
  fields: {
    id: sequence(),
    packageSize: fake(f => f.random.number(1000)),
    cost: fake(f => f.random.number(200)),
    sender: null,
    courier: null,
    date: perBuild(() => new Date()),
    description: fake(f => f.lorem.sentence()),
  }
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let request: supertest.SuperTest<supertest.Test>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = setup(moduleFixture.createNestApplication());
  
    await app.init();
  
    request = supertest(app.getHttpServer());
  
    
  });

  afterAll(async () => {
    await app.close();
  });

  it('should fail to authenticate without userType', async () => {
    const resp = await request
      .post('/authenticate')
      .send({ email: 'john@doe.courier', password: 'Pa$$w0rd' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /json/);

    expect(resp.body).toHaveProperty('error', 'Bad Request');
  });

  it('should fail to authenticate without email', async () => {
    const resp = await request
      .post('/authenticate')
      .send({ password: 'Pa$$w0rd' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /json/);

    expect(resp.body).toHaveProperty('error', 'Bad Request');
  });

  it('should fail to authenticate without email', async () => {
    const resp = await request
      .post('/authenticate')
      .send({ email: 'john@doe.courier' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Content-Type', /json/);

    expect(resp.body).toHaveProperty('error', 'Bad Request');
  });

});
