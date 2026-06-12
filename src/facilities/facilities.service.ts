import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { NearbyFacilitiesQueryDto } from './dto/nearby-facilities-query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'node:crypto';

type NearbyFacilityRow = {
  id: string;
  facilityId: string | null;
  facilityName: string;
  facilityType: string | null;
  facilityLevel: string | null;
  state: string;
  lga: string;
  ward: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  ceoName: string | null;
  servicesOffered: string[];
  ownership: string | null;
  claimedBy: string | null;
  dataSource: string | null;
  lastVerified: Date | null;
  accessibilityScore: number | null;
  verificationStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  distanceKm: number;
};

type NearbyCursor = {
  distanceKm: number;
  facilityName: string;
  id: string;
};

@Injectable()
export class FacilitiesService {
  private readonly defaultNearbyRadiusKm = 10;
  private readonly maxNearbyRadiusKm = 100;
  private readonly defaultPageSize = 10;
  private readonly maxPageSize = 50;

  constructor(private prisma: PrismaService) {}

  async create(createFacilityDto: CreateFacilityDto) {
    const data = {
      facilityId: `FAC-${randomUUID()}`,
      facilityName: createFacilityDto.facilityName,
      facilityType: createFacilityDto.facilityType,
      facilityLevel: createFacilityDto.facilityLevel,
      state: createFacilityDto.state,
      lga: createFacilityDto.lga,
      ward: createFacilityDto.ward,
      latitude: createFacilityDto.latitude,
      longitude: createFacilityDto.longitude,
      address: createFacilityDto.address,
      phone: createFacilityDto.phone,
      email: createFacilityDto.email,
      website: createFacilityDto.website,
      ceoName: createFacilityDto.ceoName,
      servicesOffered: createFacilityDto.servicesOffered ?? [],
      ownership: createFacilityDto.ownership,
      dataSource: createFacilityDto.dataSource,
      lastVerified: createFacilityDto.lastVerified,
      accessibilityScore: createFacilityDto.accessibilityScore,
      verificationStatus: createFacilityDto.verificationStatus,
    };
    const facility = await this.prisma.facility.create({ data });
    return facility;
  }

  async findAll(
    filters: Prisma.FacilityWhereInput,
    next?: string,
    pageSize?: string,
  ) {
    const take = Math.min(Math.max(Number(pageSize) || 10, 1), 50);
    const where = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined),
    ) as Prisma.FacilityWhereInput;
    const query: Prisma.FacilityFindManyArgs = { where, take };

    if (next) {
      query.cursor = { id: next };
      query.skip = 1;
    }

    const facilities = await this.prisma.facility.findMany(query);

    const newNext =
      facilities.length > 0 ? facilities[facilities.length - 1].id : null;

    return { facilities, next: newNext, count: facilities.length };
  }

  async findNearby(query: NearbyFacilitiesQueryDto) {
    const latitude = this.parseBoundedNumber(
      query.latitude,
      'latitude',
      -90,
      90,
    );
    const longitude = this.parseBoundedNumber(
      query.longitude,
      'longitude',
      -180,
      180,
    );
    const radiusKm = this.parseBoundedNumber(
      query.radiusKm,
      'radiusKm',
      0.1,
      this.maxNearbyRadiusKm,
      this.defaultNearbyRadiusKm,
    );
    const pageSize = this.parseBoundedInteger(
      query.pageSize,
      'pageSize',
      1,
      this.maxPageSize,
      this.defaultPageSize,
    );
    const radiusMeters = radiusKm * 1000;
    const cursor = query.next ? this.decodeNearbyCursor(query.next) : null;
    const distanceKmExpression = Prisma.sql`ST_Distance(
      "location"::geography,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
    ) / 1000`;

    const filters = [
      Prisma.sql`"location" IS NOT NULL`,
      Prisma.sql`ST_DWithin(
        "location"::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )`,
    ];

    if (query.facilityType) {
      filters.push(Prisma.sql`"facilityType" = ${query.facilityType}`);
    }

    if (query.ownership) {
      filters.push(Prisma.sql`"ownership" = ${query.ownership}`);
    }

    if (query.state) {
      filters.push(Prisma.sql`"state" = ${query.state}`);
    }

    if (query.lga) {
      filters.push(Prisma.sql`"lga" = ${query.lga}`);
    }

    if (cursor) {
      filters.push(Prisma.sql`(
        ${distanceKmExpression} > ${cursor.distanceKm}
        OR (
          ${distanceKmExpression} = ${cursor.distanceKm}
          AND "facilityName" > ${cursor.facilityName}
        )
        OR (
          ${distanceKmExpression} = ${cursor.distanceKm}
          AND "facilityName" = ${cursor.facilityName}
          AND "id" > ${cursor.id}
        )
      )`);
    }

    const facilities = await this.prisma.$queryRaw<NearbyFacilityRow[]>`
      SELECT
        "id",
        "facilityId",
        "facilityName",
        "facilityType",
        "facilityLevel",
        "state",
        "lga",
        "ward",
        "latitude",
        "longitude",
        "address",
        "phone",
        "email",
        "website",
        "ceoName",
        "servicesOffered",
        "ownership",
        "claimedBy",
        "dataSource",
        "lastVerified",
        "accessibilityScore",
        "verificationStatus",
        "createdAt",
        "updatedAt",
        ${distanceKmExpression} AS "distanceKm"
      FROM "Facility"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "distanceKm" ASC, "facilityName" ASC, "id" ASC
      LIMIT ${pageSize + 1}
    `;
    const page = facilities.slice(0, pageSize);
    const next =
      facilities.length > pageSize && page.length > 0
        ? this.encodeNearbyCursor(page[page.length - 1])
        : null;

    return {
      facilities: page.map((facility) => ({
        ...facility,
        distanceKm: Number(facility.distanceKm),
      })),
      next,
      count: page.length,
      radiusKm,
    };
  }

  async findOne(id: string) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    return facility;
  }

  async update(id: string, updateFacilityDto: UpdateFacilityDto) {
    await this.findOne(id);

    return this.prisma.facility.update({
      where: { id },
      data: updateFacilityDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.facility.delete({
      where: { id },
    });
  }

  private parseBoundedNumber(
    value: string | undefined,
    field: string,
    min: number,
    max: number,
    defaultValue?: number,
  ) {
    if (value === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }

      throw new BadRequestException(`${field} is required`);
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      throw new BadRequestException(
        `${field} must be a number between ${min} and ${max}`,
      );
    }

    return parsed;
  }

  private parseBoundedInteger(
    value: string | undefined,
    field: string,
    min: number,
    max: number,
    defaultValue: number,
  ) {
    const parsed = this.parseBoundedNumber(
      value,
      field,
      min,
      max,
      defaultValue,
    );

    if (!Number.isInteger(parsed)) {
      throw new BadRequestException(`${field} must be an integer`);
    }

    return parsed;
  }

  private encodeNearbyCursor(facility: NearbyFacilityRow) {
    const cursor: NearbyCursor = {
      distanceKm: Number(facility.distanceKm),
      facilityName: facility.facilityName,
      id: facility.id,
    };

    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
  }

  private decodeNearbyCursor(next: string): NearbyCursor {
    try {
      const cursor = JSON.parse(
        Buffer.from(next, 'base64url').toString('utf8'),
      ) as Partial<NearbyCursor>;

      if (
        !cursor ||
        typeof cursor.distanceKm !== 'number' ||
        !Number.isFinite(cursor.distanceKm) ||
        typeof cursor.facilityName !== 'string' ||
        typeof cursor.id !== 'string'
      ) {
        throw new Error('Invalid nearby cursor');
      }

      return {
        distanceKm: cursor.distanceKm,
        facilityName: cursor.facilityName,
        id: cursor.id,
      };
    } catch {
      throw new BadRequestException('next cursor is invalid');
    }
  }
}
