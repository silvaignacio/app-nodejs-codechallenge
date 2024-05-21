import { Module } from '@nestjs/common';
import { AntiFraudController } from './anti-fraud.controller';
import { AntiFraudService } from './anti-fraud.service';
import {ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
    }),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        inject: [ConfigService],
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: configService.get<string>('KAFKA_BROKER').split(','),
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AntiFraudController],
  providers: [AntiFraudService],
})
export class AntiFraudModule {}
