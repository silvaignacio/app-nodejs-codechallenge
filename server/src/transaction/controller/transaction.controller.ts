import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {Transaction} from "../domain/transaction.entity";
import {TransactionService} from "../service/transaction.service";
import {TransactionResponse} from "../service/domain/transaction.response";

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TransactionResponse> {
    await this.transactionService.consumeMessages('validation_fraud_result');
    return this.transactionService.findOne(id);
  }

  @Post()
  create(@Body() transaction: Transaction): Promise<Transaction> {
    return this.transactionService.create(transaction);
  }

}