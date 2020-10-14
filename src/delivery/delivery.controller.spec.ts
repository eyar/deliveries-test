import { Test, TestingModule } from '@nestjs/testing';
import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as httpMocks from 'node-mocks-http';
import { DeliveryController } from './delivery.controller';
import { Delivery } from './delivery.entity';
import { Sender } from '../user/sender.entity';
import { Courier } from '../user/courier.entity';
import { UserService } from '../user/user.service';
import { DeliveryService } from './delivery.service';
import { User } from '../user/user.entity';
import {UserType} from '../user/user.entity';
import { IsNumber } from 'class-validator';
import { RolesGuard } from '../guards/roles.guard';

const userBuilder = build<Partial<Sender>>({
  fields: {
    email: fake(f => f.internet.exampleEmail()),
    password: fake(f => f.internet.password()),
    userType: UserType.COURIER,
  },
  postBuild: u => new Sender(u),
});
const deliveryBuilder = build<Delivery>({
  fields: {
    id: sequence(),
    packageSize: fake(f => f.random.number(1000)),
    cost: fake(f => f.random.number(200)),
    sender: null,
    courier: null,
    date: perBuild(() => new Date()),
    description: fake(f => f.lorem.sentence()),
  },
  postBuild: t => Object.assign(new Delivery(), t),
});

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let repositoryMock: MockProxy<Repository<Delivery>>;

  
  beforeEach(async () => {
    repositoryMock = mock<Repository<Delivery>>();

    repositoryMock.create.mockImplementation(dto =>
      Object.assign(new Delivery(), {...dto, id:1}),
    );

    repositoryMock.save.mockImplementation((entity: any) =>
    Promise.resolve(deliveryBuilder({ overrides: entity })),
    );
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        RolesGuard,
        DeliveryService,
        {
          provide: getRepositoryToken(Delivery),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add a delivery', async () => {
    const resp = httpMocks.createResponse();

    await expect(controller.create({user: userBuilder()}, deliveryBuilder(), resp)).resolves.toBeDefined();
    expect(resp._getData()).toHaveProperty(
      'message',
      'delivery successfully added',
    );
    expect(resp._getData()).toHaveProperty('deliveryId');
  });

  it('should get deliveries', async () => {
    const resp = httpMocks.createResponse();

    await expect(controller.getSenderDeliveries({user: userBuilder(), query: {page: '', date: ''}}, resp)).resolves.toBeDefined();
    expect(resp._getData()).toHaveProperty('deliveries');
  });



});
