import {Controller, Get, Inject, OnModuleInit} from '@nestjs/common';
import { AntiFraudService } from './anti-fraud.service';
import {ClientKafka, Ctx, EventPattern, KafkaContext, Payload} from "@nestjs/microservices";
import {TransactionDto} from "./dto/transaction.dto";

@Controller()
export class AntiFraudController implements OnModuleInit {
  constructor(private readonly appService: AntiFraudService, @Inject("KAFKA_SERVICE") private kafkaClient: ClientKafka) {}


  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('validation_fraud');
    await this.kafkaClient.connect();
  }

  @EventPattern('validation_fraud')
  async handleValidationResult(@Payload() message: TransactionDto) {
    this.appService.validateTransaction(message);
  }
}
