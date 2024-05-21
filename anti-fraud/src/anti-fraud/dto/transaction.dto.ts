export class TransactionDto {
    constructor(
        public readonly id: string,
        public readonly transactionExternalId: string,
        public readonly value: number,
        public readonly transactionStatus: { name: string },
        public readonly transactionType: { name: string },
        public readonly createdAt: Date,
    ) {
    }
}