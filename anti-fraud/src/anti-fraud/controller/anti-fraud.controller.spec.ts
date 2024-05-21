import {Test, TestingModule} from '@nestjs/testing';
import {AntiFraudController} from './anti-fraud.controller';
import {AntiFraudService} from '../service/anti-fraud.service';
import {ClientKafka} from '@nestjs/microservices';
import {TransactionDto} from "../dto/transaction.dto";

describe('AntiFraudController', () => {
    let controller: AntiFraudController;
    let service: AntiFraudService;
    let kafkaClient: ClientKafka;

    beforeEach(async () => {
        kafkaClient = {subscribeToResponseOf: jest.fn(), connect: jest.fn()} as any;
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AntiFraudController],
            providers: [AntiFraudService, {provide: 'KAFKA_SERVICE', useValue: kafkaClient},],
        }).compile();

        controller = module.get<AntiFraudController>(AntiFraudController);
        service = module.get<AntiFraudService>(AntiFraudService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should validate transaction', async () => {
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
        const validateTransactionSpy = jest.spyOn(service, 'validateTransaction').mockImplementation(() => undefined);

        await controller.handleValidationResult(transaction);

        expect(validateTransactionSpy).toHaveBeenCalledWith(transaction);
    });
});