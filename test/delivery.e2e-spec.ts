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

describe('DeliveryController (e2e)', () => {
  let app: INestApplication
  let request: supertest.SuperTest<supertest.Test>
  let courierToken: string, sender1Token: string, sender2Token: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = setup(moduleFixture.createNestApplication());
  
    await app.init();
  
    request = supertest(app.getHttpServer());

    const courierRequest = await request
      .post('/authenticate')
      .send({ email: 'john@doe.courier', password: 'Pa$$w0rd', userType: 'COURIER' })
      .expect(HttpStatus.OK)
      .expect('Content-Type', /json/);
      
    expect(courierRequest.body).toHaveProperty('token');
    courierToken = courierRequest.body.token;

    const sender1Request = await request
    .post('/authenticate')
    .send({ email: 'john1@doe.sender', password: 'Pa$$w0rd', userType: 'SENDER' })
    .expect(HttpStatus.OK)
    .expect('Content-Type', /json/);
    
    expect(sender1Request.body).toHaveProperty('token');
    sender1Token = sender1Request.body.token;

    const sender2Request = await request
    .post('/authenticate')
    .send({ email: 'john2@doe.sender', password: 'Pa$$w0rd', userType: 'SENDER' })
    .expect(HttpStatus.OK)
    .expect('Content-Type', /json/);
    
    expect(sender2Request.body).toHaveProperty('token');
    sender2Token = sender2Request.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['post', '/delivery'],
    ['get', '/delivery'],
  ])('should require authentication', async (method, url) => {
    switch (method) {
      case 'post':
        await request
          .post(url)
          .send(createDeliveryBuilder())
          .expect(HttpStatus.UNAUTHORIZED);
        break;
      case 'get':
        await request.get(url).expect(HttpStatus.UNAUTHORIZED);
        break;
    }
  });

  it('should fail to add delivery as courier', async () => {
    await request
    .post('/delivery')
    .set('Authorization', `Bearer ${courierToken}`)
    .expect(HttpStatus.FORBIDDEN)
  });

  it('should not add a delivery without cost', async () => {
    await request
    .post('/delivery')
    .set('Authorization', `Bearer ${sender1Token}`)
    .expect(HttpStatus.BAD_REQUEST)
  });

  it('should add a delivery as sender', async () => {

    const addDeliveryRequest = await request
    .post('/delivery')
    .set('Authorization', `Bearer ${sender1Token}`)
    .send({ cost: 50 })
    .expect(HttpStatus.CREATED)

    expect(addDeliveryRequest.body).toHaveProperty('deliveryId')
  });

  it('should get deliveries for sender', async () => {
    const addDelivery1Request = await request
    .post('/delivery')
    .set('Authorization', `Bearer ${sender2Token}`)
    .send({ cost: 50 })
    .expect(HttpStatus.CREATED)

    expect(addDelivery1Request.body).toHaveProperty('deliveryId')

    const addDelivery2Request = await request
    .get('/delivery')
    .set('Authorization', `Bearer ${sender2Token}`)
    .send()
    .expect(HttpStatus.OK)

    expect(addDelivery2Request.body).toHaveProperty('deliveries')
  });
});
