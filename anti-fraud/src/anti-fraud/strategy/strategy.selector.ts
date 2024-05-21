import {ValidationStrategy} from "./validation.strategy";
import {TransactionDto} from "../dto/transaction.dto";

export class StrategySelector {
    private readonly strategies: ValidationStrategy[];

    constructor(strategies: ValidationStrategy[]) {
        this.strategies = strategies;
    }

    selectStrategy(transaction: TransactionDto): ValidationStrategy {
        for (const strategy of this.strategies) {
            if (strategy.isApplicable(transaction)) {
                return strategy;
            }
        }
        throw new Error('No applicable strategy found');
    }
}