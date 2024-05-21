import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";
import {TransactionStatus, TransferType} from "./transaction.enum";

@Entity('transactions')
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    transactionExternalId: string;

    @Column()
    accountExternalIdDebit: string;

    @Column()
    accountExternalIdCredit: string;

    @Column({ type: 'enum', enum: TransferType, default: TransferType.Debit})
    transferTypeId: TransferType;

    @Column('decimal')
    value: number;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    transactionStatus: TransactionStatus;

    @CreateDateColumn()
    createdAt: Date;
}