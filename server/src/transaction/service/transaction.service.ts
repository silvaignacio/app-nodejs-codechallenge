import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Transaction} from "../domain/transaction.entity";
import {TransactionStatus, TransferType} from "../domain/transaction.enum";
import {Kafka} from "kafkajs";
import {TransactionResponse} from "./domain/transaction.response";

@Injectable()
export class TransactionService {

    private kafka;

    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>
    ) {
        this.kafka = new Kafka({
            brokers: ['localhost:9092'],
        });
    }

    async findOne(id: string): Promise<TransactionResponse> {
        const transaction = await this.transactionRepository.findOne({where: {id}});
        const transferTypeName = TransferType[transaction.transferTypeId];
        return {
            transactionExternalId: transaction.transactionExternalId,
            transactionType: {
                name: transferTypeName
            },
            transactionStatus: {
                name: transaction.transactionStatus
            },
            value: transaction.value,
            createdAt: transaction.createdAt,
        };
    }

    async update(transaction: any): Promise<Transaction> {

        const transactionFound = await this.transactionRepository.findOne({where: {id: transaction.transactionExternalId}});

        const statusMapping = {
            'APPROVED': TransactionStatus.APPROVED,
            'REJECTED': TransactionStatus.REJECTED,
        };

        transactionFound.transactionStatus = statusMapping[transaction.status];

        return this.transactionRepository.save(transactionFound);
    }

    async create(transaction: Transaction): Promise<Transaction> {

        if (transaction.transferTypeId == 1) {
            transaction.transactionExternalId = transaction.accountExternalIdCredit;
        } else {
            transaction.transactionExternalId = transaction.accountExternalIdDebit;
        }
        await this.sendMessage('validation_fraud', JSON.stringify(transaction));
        return this.transactionRepository.save(transaction);
    }


    async sendMessage(topic: string, message: string) {
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
            topic,
            messages: [{ value: message }],
        });
        await producer.disconnect();
    }

    async consumeMessages(topic: string) {
        const consumer = this.kafka.consumer({ groupId: 'fraud_topic' });
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                await this.update(JSON.parse(message.value.toString()));
            },
        });
    }
}