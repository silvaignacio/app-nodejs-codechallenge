import {Test, TestingModule} from '@nestjs/testing';
import {TransactionController} from './transaction.controller';
import {TransactionService} from "../service/transaction.service";

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
                        findAll: jest.fn().mockResolvedValue([
                            {
                                transactionExternalId: 'test-id',
                                accountExternalIdDebit: 'test-debit',
                                accountExternalIdCredit: 'test-credit',
                                tranferTypeId: 1,
                                value: 100,
                                transactionStatus: 'pending',
                                createdAt: '2024-05-20T23:13:25.942Z',
                            },
                        ]),
                    },
                },
            ],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
        service = module.get<TransactionService>(TransactionService);
    });
});