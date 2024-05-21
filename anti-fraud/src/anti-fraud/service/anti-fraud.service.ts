import {Inject, Injectable} from '@nestjs/common';
import {ClientKafka} from "@nestjs/microservices";
import {TransactionDto} from "../dto/transaction.dto";
import {HighValueStrategy} from "../strategy/HighValueStrategy";
import {LowValueStrategy} from "../strategy/LowValueStrategy";
import {ValidationStrategy} from "../strategy/ValidationStrategy";
import {StrategySelector} from "../strategy/StrategySelector";

@Injectable()
export class AntiFraudService {

    private strategySelector: StrategySelector;

    constructor(@Inject("KAFKA_SERVICE") private kafkaClient: ClientKafka) {
        const strategies = [new HighValueStrategy(), new LowValueStrategy()];
        this.strategySelector = new StrategySelector(strategies);
    }

    validateTransaction(transaction: TransactionDto): void {
        const strategy = this.strategySelector.selectStrategy(transaction);
        const isValid = strategy.validate();
        const status = isValid ? "APPROVED" : "REJECTED";

        this.kafkaClient.emit('validation_fraud_results', {
            transactionExternalId: transaction.transactionExternalId,
            status
        })
            .subscribe({
                next: (value) => console.log('Notificacion enviada'),
                error: (error) => console.log('Error al enviar el mensaje: ', error),
                complete: () => console.log('Emisión de notificacion completada'),
            });
    }
}
