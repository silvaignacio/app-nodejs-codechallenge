import {ValidationStrategy} from "./ValidationStrategy";
import {TransactionDto} from "../dto/transaction.dto";

export class HighValueStrategy implements ValidationStrategy {
    validate(): boolean {
        return false;
    }

    isApplicable(transaction: TransactionDto): boolean {
        return transaction.value > 1000;
    }
}