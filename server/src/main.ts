import {NestFactory} from '@nestjs/core';
import {TransactionModule} from "./transaction/transaction.module";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(TransactionModule);
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3001);
}

bootstrap();
