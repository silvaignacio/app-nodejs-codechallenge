import {Test, TestingModule} from '@nestjs/testing';
import {AntiFraudController} from './controller/anti-fraud.controller';
import {AntiFraudService} from './service/anti-fraud.service';
import {ClientKafka} from '@nestjs/microservices';

jest.mock('@nestjs/microservices');

describe('AntiFraudController', () => {
    let controller: AntiFraudController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AntiFraudController],
            providers: [
                AntiFraudService,
                {
                    provide: 'KAFKA_SERVICE',
                    useValue: new ClientKafka({}),
                },
            ],
        }).compile();

        controller = module.get<AntiFraudController>(AntiFraudController);
    });

    it('should call validateTransaction with the correct message', async () => {
        const message: any = {value: 500, transactionStatus: 'APPROVED', transactionExternalId: '123'};
        const validateTransactionSpy = jest.spyOn(controller['appService'], 'validateTransaction');

        await controller.handleValidationResult(message);

        expect(validateTransactionSpy).toHaveBeenCalledWith(message);
    });
});