import { Test, TestingModule } from '@nestjs/testing';
import { KafkaService } from './kafka.service';

jest.mock('kafkajs', () => {
  return {
    Kafka: jest.fn(() => ({
      producer: jest.fn(() => ({
        connect: jest.fn(),
        send: jest.fn(),
        disconnect: jest.fn(),
      })),
      consumer: jest.fn(() => ({
        connect: jest.fn(),
        subscribe: jest.fn(),
        run: jest.fn(),
      })),
    })),
  };
});

describe('KafkaService', () => {
  let service: KafkaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaService,
        {
          provide: 'KAFKA_BROKER',
          useValue: 'localhost:9092',
        },
      ],
    }).compile();

    service = module.get<KafkaService>(KafkaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a message', async () => {
    const result = await service.sendMessage('test-topic', 'test-message');
    expect(result).toBeUndefined();
  });

  it('should consume messages', async () => {
    const messageHandler = jest.fn();
    await service.consumeMessages('test-topic', messageHandler);
    expect(messageHandler).not.toHaveBeenCalled();
  });
});