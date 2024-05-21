import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";
import {TransactionStatus, TransferType} from "./transaction.enum";

@Entity('transactions')
export class Transaction {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    transactionExternalId: string;

    @Column({nullable: true})
    accountExternalIdDebit: string;

    @Column({nullable: true})
    accountExternalIdCredit: string;

    @Column({type: 'enum', enum: TransferType, default: TransferType.Debit})
    transferTypeId: TransferType;

    @Column('decimal')
    value: number;

    @Column({type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING})
    transactionStatus: TransactionStatus;

    @CreateDateColumn()
    createdAt: Date;
}