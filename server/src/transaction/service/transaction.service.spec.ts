import {Test, TestingModule} from '@nestjs/testing';
import {TransactionService} from './transaction.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Transaction} from '../domain/transaction.entity';
import {Kafka} from 'kafkajs';
import {TransactionStatus} from "../domain/transaction.enum";
import {KafkaService} from "../../kafka/kafka.service";

function mockFindOne(repo: Repository<Transaction>) {
    return jest.spyOn(repo, 'findOne').mockResolvedValueOnce({
        transferTypeId: 1,
        transactionExternalId: 'test-id',
        id: 'test-id',
        transactionStatus: TransactionStatus.PENDING,
        accountExternalIdDebit: 'test-debit',
        accountExternalIdCredit: 'test-credit',
        createdAt: new Date(),
        value: 100
    });
}

function mockFindOneError(repo: Repository<Transaction>) {
    return jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
}

describe('TransactionService', () => {
  let service: TransactionService;
  let repo: Repository<Transaction>;
  let kafkaClient: Kafka;

  beforeEach(async () => {
    kafkaClient = { producer: jest.fn().mockReturnThis(), consumer: jest.fn().mockReturnThis() } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
          KafkaService,
        { provide: getRepositoryToken(Transaction), useValue: { findOne: jest.fn(), update: jest.fn(), save: jest.fn() } },
        { provide: 'KAFKA_BROKER', useValue: 'localhost:9092' },
        { provide: Kafka, useValue: kafkaClient },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repo = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one transaction', async () => {
    const id = 'test-id';
    const findOneSpy = mockFindOne(repo);

    await service.findOne(id);

    expect(findOneSpy).toHaveBeenCalledWith({ where: { id } });
  });

    it('should update a transaction approved but findOne error', async () => {
        const transaction = { transactionExternalId: 'test-id', status: 'APPROVED' };
        const findOneSpy = mockFindOne(repo);
        const updateSpy = jest.spyOn(repo, 'update');

        await service.update(transaction);

        expect(findOneSpy).toHaveBeenCalledWith({ where: { transactionExternalId: transaction.transactionExternalId } });
        expect(updateSpy).toHaveBeenCalledWith({ id: 'test-id' }, { transactionStatus: 'approved' });
    });


  it('should update a transaction approved', async () => {
    const transaction = { transactionExternalId: 'test-id', status: 'APPROVED' };
      const findOneSpy = mockFindOne(repo);
      const updateSpy = jest.spyOn(repo, 'update');

    await service.update(transaction);

    expect(findOneSpy).toHaveBeenCalledWith({ where: { transactionExternalId: transaction.transactionExternalId } });
    expect(updateSpy).toHaveBeenCalledWith({ id: 'test-id' }, { transactionStatus: 'approved' });
  });

  it('should create a transaction', async () => {
    const transactionDto = { accountExternalIdCredit: 'test-credit', accountExternalIdDebit: 'test-credit', tranferTypeId: 1, value: 100 };
    const saveSpy = jest.spyOn(repo, 'save').mockResolvedValueOnce(null);

    await service.create(transactionDto);

    expect(saveSpy).toHaveBeenCalled();
  });

    it('should create a transaction debit', async () => {
        const transactionDto = { accountExternalIdCredit: 'test-debit', accountExternalIdDebit: 'test-debit', tranferTypeId: 2, value: 100 };
        const saveSpy = jest.spyOn(repo, 'save').mockResolvedValueOnce(null);

        await service.create(transactionDto);

        expect(saveSpy).toHaveBeenCalled();
    });

    it('should throw an error for unknown transaction type', async () => {
        const transactionDto = { accountExternalIdCredit: 'test-debit', accountExternalIdDebit: 'test-debit', tranferTypeId: 3, value: 100 };

        await expect(service.create(transactionDto)).rejects.toThrow('Invalid transfer type');
    });

});