import {TransactionDto} from "../dto/transaction.dto";

export interface ValidationStrategy {
    validate(): boolean;
    isApplicable(transaction: TransactionDto): boolean;
}