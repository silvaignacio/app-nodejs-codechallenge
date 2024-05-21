import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TransactionService} from "./service/transaction.service";
import {Transaction} from "./domain/transaction.entity";
import {TransactionController} from "./controller/transaction.controller";

@Module({
    imports: [TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5433,
        username: 'postgres',
        password: 'postgres',
        database: 'challenge_yape',
        entities: [Transaction],
        synchronize: true,
    }),
      TypeOrmModule.forFeature([Transaction])
    ],
    providers: [TransactionService],
    exports: [TransactionService],
    controllers: [TransactionController]
})
export class TransactionModule {
}