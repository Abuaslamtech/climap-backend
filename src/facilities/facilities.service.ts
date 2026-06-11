import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class FacilitiesService {
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
}
