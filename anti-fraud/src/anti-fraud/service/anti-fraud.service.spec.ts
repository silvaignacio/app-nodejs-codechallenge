import { Test, TestingModule } from '@nestjs/testing';
import { AntiFraudService } from './anti-fraud.service';
import { ClientKafka } from '@nestjs/microservices';
import { TransactionDto } from "../dto/transaction.dto";
import { HighValueStrategy } from "../strategy/high-value.strategy";
import { LowValueStrategy } from "../strategy/low-value.strategy";
import { StrategySelector } from "../strategy/strategy.selector";

describe('AntiFraudService', () => {
  let service: AntiFraudService;
  let kafkaClient: ClientKafka;
  let strategySelector: StrategySelector;

  beforeEach(async () => {
    kafkaClient = { emit: jest.fn().mockReturnThis(), subscribe: jest.fn() } as any;
    strategySelector = { selectStrategy: jest.fn() } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AntiFraudService,
        { provide: 'KAFKA_SERVICE', useValue: kafkaClient },
        { provide: StrategySelector, useValue: strategySelector },
      ],
    }).compile();

    service = module.get<AntiFraudService>(AntiFraudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate transaction', () => {
    const transaction: TransactionDto = {
      value: 500, transactionStatus: {
        name: 'APPROVED'
      },
      transactionExternalId: '123',
      createdAt: new Date(),
      transactionType: {
        name: 'CREDIT'
      }, id: '123'
    };
    const strategy = { validate: jest.fn().mockReturnValue(true) };
    strategySelector.selectStrategy(transaction);

    service.validateTransaction(transaction);

    expect(strategySelector.selectStrategy).toHaveBeenCalledWith(transaction);
    expect(kafkaClient.emit).toHaveBeenCalledWith('validation_fraud_results', {
      transactionExternalId: transaction.transactionExternalId,
      status: 'APPROVED'
    });
  });

    it('should validate rejected transaction', () => {
        const transaction: TransactionDto = {
            value: 1230, transactionStatus: {
                name: 'REJECTED'
            },
            transactionExternalId: '123',
            createdAt: new Date(),
            transactionType: {
                name: 'CREDIT'
            }, id: '1230'
        };
        const strategy = { validate: jest.fn().mockReturnValue(false) };
        strategySelector.selectStrategy(transaction);

        service.validateTransaction(transaction);

        expect(strategySelector.selectStrategy).toHaveBeenCalledWith(transaction);
        expect(kafkaClient.emit).toHaveBeenCalledWith('validation_fraud_results', {
            transactionExternalId: transaction.transactionExternalId,
            status: 'REJECTED'
        });
    });
});