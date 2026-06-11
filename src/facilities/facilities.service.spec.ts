import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('FacilitiesService', () => {
  let service: FacilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        {
          provide: PrismaService,
          useValue: {
            facility: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
