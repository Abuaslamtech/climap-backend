import { Injectable } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createFacilityDto: CreateFacilityDto) {
    const data = {
      facilityId: `FAC-${uuidv4()}`,
      facilityName: createFacilityDto.facilityName,
      facilityType: createFacilityDto.facilityType,
      facilityLevel: createFacilityDto.facilityLevel,
      state: createFacilityDto.state,
      lga: createFacilityDto.lga,
      ward: createFacilityDto.ward,
      latitude: createFacilityDto.latitude,
      longitude: createFacilityDto.longitude,
      hasCoordinates: createFacilityDto.hasCoordinates ?? false,
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

  async findAll(filters: any, next?: string, pageSize = 10) {
    const query: any = { where: filters, take: pageSize };

    if (next) {
      query.cursor = { id: next };
      query.skip = 1;
    }

    const facilities = await this.prisma.facility.findMany(query);

    const newNext =
      facilities.length > 0 ? facilities[facilities.length - 1].id : null;

    return { facilities, next: newNext, count: facilities.length };
  }

  findOne(id: number) {
    return `This action returns a #${id} facility`;
  }

  update(id: number, updateFacilityDto: UpdateFacilityDto) {
    return `This action updates a #${id} facility`;
  }

  remove(id: number) {
    return `This action removes a #${id} facility`;
  }
}
