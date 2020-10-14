import { build, fake, perBuild, sequence } from '@jackfranklin/test-data-bot';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import * as httpMocks from 'node-mocks-http';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { debug } from 'console';
import {UserType} from '../user/user.entity';
import { Sender } from '../user/sender.entity';
import { Courier } from '../user/courier.entity';

const userBuilder = build<Partial<User>>({
  fields: {
    email: fake(f => f.internet.exampleEmail()),
    password: fake(f => f.internet.password()),
    userType: UserType.COURIER,
  },
  postBuild: u => new User(u),
});

describe('AuthController', () => {
  let controller: AuthController;
  const repositoryMock = mock<Repository<User>>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        {
          provide: getRepositoryToken(Sender),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Courier),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
        {
          provide: 'JwtService',
          useValue: {
            sign(payload) {
              return payload.sub
                .split('')
                .reduce(
                  (prev, current) => prev + current.charCodeAt(0).toString(16),
                  '',
                );
            },
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    expect.assertions(2);
    const register = {
      email: 'john@doe.me',
      password: 'Pa$$w0rd',
      userType: UserType.COURIER
    };
    const resp = httpMocks.createResponse();
    repositoryMock.save.mockResolvedValue(
      userBuilder({ overrides: register }) as User,
    );

    await expect(controller.login(resp, register)).resolves.toBeDefined();
    expect(resp._getData()).toHaveProperty(
      'token',
      '6a6f686e40646f652e6d65',
    );
  });

  it('should log in a user', async () => {
    expect.assertions(2);
    const resp = httpMocks.createResponse();
    const login = {
        email: 'john@doe.me',
        password: 'Pa$$w0rd',
        userType: UserType.COURIER
      };
    
      await expect(controller.login(resp, login as User)).resolves.toBeDefined();
    expect(resp._getData()).toHaveProperty(
      'token',
      '6a6f686e40646f652e6d65',
    );
  });

});
