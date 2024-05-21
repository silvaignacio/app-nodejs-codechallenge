import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TransactionService} from "./service/transaction.service";
import {Transaction} from "./domain/transaction.entity";
import {TransactionController} from "./controller/transaction.controller";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {KafkaService} from "../kafka/kafka.service";

@Module({
    imports: [ConfigModule.forRoot(
        {
            isGlobal: true,
            envFilePath: '.env',
        }
    ), TypeOrmModule.forRootAsync({
        imports: [ConfigModule], inject: [ConfigService], useFactory: async (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            entities: [Transaction],
            synchronize: true,
        }),
    }), TypeOrmModule.forFeature([Transaction])], providers: [TransactionService, {
        provide: 'KAFKA_BROKER',
        useFactory: (configService: ConfigService) => configService.get('KAFKA_BROKER'),
        inject: [ConfigService],
    }, KafkaService], exports: [TransactionService], controllers: [TransactionController]
})
export class TransactionModule {
}