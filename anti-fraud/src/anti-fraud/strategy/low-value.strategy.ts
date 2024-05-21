import {ValidationStrategy} from "./validation.strategy";
import {TransactionDto} from "../dto/transaction.dto";

export class LowValueStrategy implements ValidationStrategy {
    validate(): boolean {
        return true;
    }

    isApplicable(transaction: TransactionDto): boolean {
        return transaction.value <= 1000;
    }
}