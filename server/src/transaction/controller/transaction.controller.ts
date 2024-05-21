import {Body, Controller, Get, OnModuleInit, Param, Post} from '@nestjs/common';
import {Transaction} from "../domain/transaction.entity";
import {TransactionService} from "../service/transaction.service";
import {TransactionResponse} from "../service/domain/transaction.response";
import {TransactionDto} from "./dto/transaction.dto";

@Controller('transactions')
export class TransactionController implements OnModuleInit {
    constructor(private readonly transactionService: TransactionService) {
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<TransactionResponse> {
        return this.transactionService.findOne(id);
    }

    @Post()
    create(@Body() transaction: TransactionDto): Promise<Transaction> {
        return this.transactionService.create(transaction);
    }

    async onModuleInit() {
        await this.transactionService.consumeMessages('validation_fraud_results');
    }

}