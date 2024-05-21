import {Inject, Injectable} from '@nestjs/common';
import {ClientKafka} from "@nestjs/microservices";
import {TransactionDto} from "./dto/transaction.dto";

@Injectable()
export class AntiFraudService {


  constructor(@Inject("KAFKA_SERVICE") private kafkaClient: ClientKafka) {
  }

  validateTransaction(transaction: TransactionDto): void {
    if(transaction.value > 1000) {
        this.kafkaClient.emit('validation_fraud_result', { transactionId: transaction.transactionExternalId, status: "REJECTED"});
        return;
    }
    this.kafkaClient.emit('validation_fraud_result', { transactionId: transaction.transactionExternalId, status: "APPROVED"});
  }
}
