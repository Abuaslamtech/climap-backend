import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';

describe('FacilitiesController', () => {
  let controller: FacilitiesController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findNearby: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findNearby: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitiesController],
      providers: [
        {
          provide: FacilitiesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<FacilitiesController>(FacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('forwards nearby facility queries to the service', () => {
    const query = {
      latitude: '6.5244',
      longitude: '3.3792',
      radiusKm: '10',
      pageSize: '20',
    };
    const response = { facilities: [], count: 0, radiusKm: 10 };
    service.findNearby.mockReturnValue(response);

    expect(controller.findNearby(query)).toBe(response);
    expect(service.findNearby).toHaveBeenCalledWith(query);
  });
});
