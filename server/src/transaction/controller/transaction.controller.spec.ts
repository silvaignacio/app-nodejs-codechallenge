import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../service/transaction.service';
import { TransactionDto } from './dto/transaction.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue({}),
            consumeMessages: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find one transaction', async () => {
    const id = 'test-id';
    const findOneSpy = jest.spyOn(service, 'findOne');

    await controller.findOne(id);

    expect(findOneSpy).toHaveBeenCalledWith(id);
  });

  it('should create a transaction', async () => {
    const transaction: TransactionDto = {
      accountExternalIdDebit: 'test-debit',
      accountExternalIdCredit: 'test-credit',
      tranferTypeId: 1,
      value: 100,
    };
    const createSpy = jest.spyOn(service, 'create');

    await controller.create(transaction);

    expect(createSpy).toHaveBeenCalledWith(transaction);
  });

});