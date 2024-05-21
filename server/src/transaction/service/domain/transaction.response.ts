export class TransactionResponse {
    constructor(
        public readonly transactionExternalId: string,
        public readonly value: number,
        public readonly transactionStatus: { name: string },
        public readonly transactionType: { name: string },
        public readonly createdAt: Date,
    ) {}
}