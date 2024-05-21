import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Transaction} from "../domain/transaction.entity";
import {TransactionStatus, TransferType} from "../domain/transaction.enum";
import {Kafka} from "kafkajs";
import {TransactionResponse} from "./domain/transaction.response";
import {TransactionDto} from "../controller/dto/transaction.dto";

@Injectable()
export class TransactionService {

    private kafka;

    constructor(@InjectRepository(Transaction) private transactionRepository: Repository<Transaction>, @Inject('KAFKA_BROKER') kafkaBroker: string) {
        this.kafka = new Kafka({
            brokers: [kafkaBroker], retry: {
                initialRetryTime: 100, retries: 8
            }
        });
    }

    async findOne(id: string): Promise<TransactionResponse> {
        const transaction = await this.transactionRepository.findOne({where: {id}});
        const transferTypeName = TransferType[transaction.transferTypeId];
        return {
            transactionExternalId: transaction.transactionExternalId, transactionType: {
                name: transferTypeName
            }, transactionStatus: {
                name: transaction.transactionStatus
            }, value: transaction.value, createdAt: transaction.createdAt,
        };
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

        await this.sendMessage('validation_fraud', JSON.stringify(transaction));
        return this.transactionRepository.save(transaction);
    }

    async sendMessage(topic: string, message: string) {
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
            topic, messages: [{value: message}],
        });
        await producer.disconnect();
    }

    async consumeMessages(topic: string) {
        try {
            const consumer = this.kafka.consumer({groupId: 'fraud_topic'});
            await consumer.connect();
            await consumer.subscribe({topic, fromBeginning: true});

            await consumer.run({
                eachBatch: async ({batch, resolveOffset, heartbeat, isRunning, isStale}) => {
                    for (let message of batch.messages) {
                        try {
                            await this.update(JSON.parse(message.value.toString()));
                            resolveOffset(message.offset);
                            await heartbeat();
                        } catch (error) {
                            console.error(`Error processing message: ${error} at ${message}`);
                        }
                    }
                }, eachBatchAutoResolve: false
            });
        } catch (error) {
            console.error(`Error consuming messages: ${error}`);
        }
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