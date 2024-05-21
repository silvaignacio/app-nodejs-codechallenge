import {Inject, Injectable} from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService {
    private kafka;

    constructor(@Inject('KAFKA_BROKER') kafkaBroker: string) {
        this.kafka = new Kafka({
            brokers: [kafkaBroker], retry: {
                initialRetryTime: 100, retries: 8
            }
        });
    }

    async sendMessage(topic: string, message: string) {
        const producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
            topic, messages: [{value: message}],
        });
        await producer.disconnect();
    }

    async consumeMessages(topic: string, messageHandler: (message: any) => Promise<void>) {
        try {
            const consumer = this.kafka.consumer({groupId: 'fraud_topic'});
            await consumer.connect();
            await consumer.subscribe({topic, fromBeginning: true});

            await consumer.run({
                eachBatch: async ({batch, resolveOffset, heartbeat, isRunning, isStale}) => {
                    for (let message of batch.messages) {
                        try {
                            await messageHandler(JSON.parse(message.value.toString()));
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
}