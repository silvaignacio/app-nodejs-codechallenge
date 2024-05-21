import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Transaction} from "../domain/transaction.entity";
import {TransactionStatus, TransferType} from "../domain/transaction.enum";
import {Kafka} from "kafkajs";
import {TransactionResponse} from "./domain/transaction.response";
import {TransactionDto} from "../controller/dto/transaction.dto";
import {KafkaService} from "../../kafka/kafka.service";

@Injectable()
export class TransactionService implements OnModuleInit {

    constructor(@InjectRepository(Transaction) private transactionRepository: Repository<Transaction>,
                private kafkaService: KafkaService){
    }

    async onModuleInit() {
       await this.kafkaService.consumeMessages('validation_fraud_results', this.update.bind(this));
    }

    async findOne(id: string): Promise<TransactionResponse> {
        const transaction = await this.transactionRepository.findOne({where: {id}});

        this.validateFoundTransaction(transaction, id);

        const transferTypeName = TransferType[transaction.transferTypeId];
        return {
            transactionExternalId: transaction.transactionExternalId, transactionType: {
                name: transferTypeName
            }, transactionStatus: {
                name: transaction.transactionStatus
            }, value: transaction.value, createdAt: transaction.createdAt,
        };
    }

    private validateFoundTransaction(transaction: Transaction, id: string) {
        if (!transaction) {
            throw new Error(`Transaction with id ${id} not found`);
        }
    }

    async update(transaction: any): Promise<void> {

        const transactionFound = await this.transactionRepository.findOne({where: {transactionExternalId: transaction.transactionExternalId}});

        const statusMapping = {
            'APPROVED': TransactionStatus.APPROVED, 'REJECTED': TransactionStatus.REJECTED,
        };

        await this.transactionRepository
            .update({id: transactionFound.id}, {transactionStatus: statusMapping[transaction.status]});

    }

    async create(transactionDto: TransactionDto): Promise<Transaction> {

        const transactionIdSetterMap = new Map([[TransferType.Credit, () => transactionDto.accountExternalIdCredit], [TransferType.Debit, () => transactionDto.accountExternalIdDebit]]);

        const setId = transactionIdSetterMap.get(transactionDto.tranferTypeId);

        if (!setId) {
            throw new Error('Invalid transfer type');
        }

        const transaction = this.setValuesNewTransaction(setId, transactionDto);

        await this.kafkaService.sendMessage('validation_fraud', JSON.stringify(transaction));
        return this.transactionRepository.save(transaction);
    }

    private setValuesNewTransaction(setId: () => string, transactionDto: TransactionDto): Transaction {
        const transaction = new Transaction();

        transaction.transactionExternalId = setId();
        transaction.accountExternalIdCredit = transactionDto.accountExternalIdCredit;
        transaction.accountExternalIdDebit = transactionDto.accountExternalIdDebit;
        transaction.transactionStatus = TransactionStatus.PENDING;
        transaction.value = transactionDto.value;
        return transaction
    }
}