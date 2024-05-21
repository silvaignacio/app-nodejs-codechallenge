import {Inject, Injectable} from '@nestjs/common';
import {ClientKafka} from "@nestjs/microservices";
import {TransactionDto} from "./dto/transaction.dto";

@Injectable()
export class AntiFraudService {


  constructor(@Inject("KAFKA_SERVICE") private kafkaClient: ClientKafka) {
  }

  validateTransaction(transaction: TransactionDto): void {
    if(transaction.value > 1000) {
        this.kafkaClient.emit('validation_fraud_results', { transactionExternalId: transaction.transactionExternalId, status: "REJECTED"})
            .subscribe({
                next: (value) => console.log('Notificacion enviada'),
                error: (error) => console.log('Error al enviar el mensaje: ', error),
                complete: () => console.log('Emisión de notificacion completada'),
            });
        return;
    }
    this.kafkaClient.emit('validation_fraud_results', { transactionExternalId: transaction.transactionExternalId, status: "APPROVED"})
        .subscribe({
            next: (value) => console.log('Notificacion enviada'),
            error: (error) => console.log('Error al enviar el mensaje: ', error),
            complete: () => console.log('Emisión de notificada completada'),
        });
  }
}
