import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('FacilitiesService', () => {
  let service: FacilitiesService;
  let prisma: {
    $queryRaw: jest.Mock;
    facility: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
      facility: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearby', () => {
    const nearbyFacility = (overrides: Record<string, unknown> = {}) => ({
      id: 'facility-1',
      facilityId: 'FAC-1',
      facilityName: 'Lagos General Hospital',
      facilityType: 'Hospital',
      facilityLevel: 'Secondary',
      state: 'Lagos',
      lga: 'Lagos Island',
      ward: null,
      latitude: 6.45,
      longitude: 3.39,
      address: null,
      phone: null,
      email: null,
      website: null,
      ceoName: null,
      servicesOffered: [],
      ownership: 'Public',
      claimedBy: null,
      dataSource: null,
      lastVerified: null,
      accessibilityScore: null,
      verificationStatus: null,
      createdAt: new Date('2026-06-11T00:00:00.000Z'),
      updatedAt: new Date('2026-06-11T00:00:00.000Z'),
      distanceKm: '2.41',
      ...overrides,
    });

    it('returns facilities ordered by PostGIS distance', async () => {
      prisma.$queryRaw.mockResolvedValue([nearbyFacility()]);

      const result = await service.findNearby({
        latitude: '6.5244',
        longitude: '3.3792',
        radiusKm: '10',
        pageSize: '20',
        facilityType: 'Hospital',
        ownership: 'Public',
      });

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        facilities: [
          expect.objectContaining({
            id: 'facility-1',
            facilityName: 'Lagos General Hospital',
            distanceKm: 2.41,
          }),
        ],
        next: null,
        count: 1,
        radiusKm: 10,
      });
    });

    it('applies default radius and page size', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      const result = await service.findNearby({
        latitude: '6.5244',
        longitude: '3.3792',
      });

      expect(result).toEqual({
        facilities: [],
        next: null,
        count: 0,
        radiusKm: 10,
      });
    });

    it('returns a next cursor when more nearby facilities are available', async () => {
      prisma.$queryRaw.mockResolvedValue([
        nearbyFacility(),
        nearbyFacility({
          id: 'facility-2',
          facilityId: 'FAC-2',
          facilityName: 'Mainland Clinic',
          distanceKm: '3.12',
        }),
      ]);

      const result = await service.findNearby({
        latitude: '6.5244',
        longitude: '3.3792',
        pageSize: '1',
      });
      const cursor = JSON.parse(
        Buffer.from(result.next as string, 'base64url').toString('utf8'),
      ) as { distanceKm: number; facilityName: string; id: string };

      expect(result.facilities).toHaveLength(1);
      expect(result.next).toEqual(expect.any(String));
      expect(cursor).toEqual({
        distanceKm: 2.41,
        facilityName: 'Lagos General Hospital',
        id: 'facility-1',
      });
      expect(result.count).toBe(1);
    });

    it('rejects invalid nearby cursors', async () => {
      await expect(
        service.findNearby({
          latitude: '6.5244',
          longitude: '3.3792',
          next: 'not-a-valid-cursor',
        }),
      ).rejects.toThrow('next cursor is invalid');

      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('rejects coordinates outside valid ranges', async () => {
      await expect(
        service.findNearby({
          latitude: '91',
          longitude: '3.3792',
        }),
      ).rejects.toThrow('latitude must be a number between -90 and 90');

      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('rejects page sizes above the configured cap', async () => {
      await expect(
        service.findNearby({
          latitude: '6.5244',
          longitude: '3.3792',
          pageSize: '51',
        }),
      ).rejects.toThrow('pageSize must be a number between 1 and 50');

      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });
});
