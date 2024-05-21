import {NestFactory} from '@nestjs/core';
import {AntiFraudModule} from './anti-fraud/anti-fraud.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AntiFraudModule, {
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: ['localhost:9092'],
            }
        }
    });
    await app.listen();
}

bootstrap();
