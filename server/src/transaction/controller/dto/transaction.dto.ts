import {IsNumber, IsString, Max, Min} from "class-validator";

export class TransactionDto {
    @IsString()
    accountExternalIdDebit: string;
    @IsString()
    accountExternalIdCredit: string;
    @IsNumber()
    tranferTypeId: number;
    @IsNumber()
    @Max(100000)
    @Min(1)
    value: number;
}