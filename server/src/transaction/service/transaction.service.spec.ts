import {Test, TestingModule} from '@nestjs/testing';
import {TransactionService} from './transaction.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Transaction} from "../domain/transaction.entity";
import {TransactionStatus} from "../domain/transaction.enum";
import {TransactionResponse} from "./domain/transaction.response";

describe('TransactionService', () => {
    let service: TransactionService;
    let repo: Repository<Transaction>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionService,
                {
                    provide: getRepositoryToken(Transaction),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
        repo = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    });

    function getMockTransaction() {
        const transaction = new Transaction();
        transaction.transactionExternalId = 'transactionExternalId';
        transaction.value = 100;
        transaction.transactionStatus = TransactionStatus.PENDING;
        transaction.transferTypeId = 1;
        transaction.createdAt = new Date();
        return transaction;
    }

    it('should find one transaction', async () => {
        const transaction = getMockTransaction();

        const transactionResponse = new TransactionResponse('transactionExternalId',
            100,
            {name: 'pending'},
            {name: 'Credit'},
            new Date(),);
        const id = 'test-id';

        jest.spyOn(repo, 'findOne').mockResolvedValueOnce(transaction);
        const result = await service.findOne(id);

        expect(repo.findOne).toHaveBeenCalledWith({where: {id}});
        expect(result).toEqual(transactionResponse);
    });

    it('should create a transaction', async () => {
        const transaction = new Transaction();

        jest.spyOn(repo, 'save').mockResolvedValueOnce(transaction);
        const result = await service.create(transaction);

        expect(repo.save).toHaveBeenCalledWith(transaction);
        expect(result).toEqual(transaction);
    });

});