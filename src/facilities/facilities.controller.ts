import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { NearbyFacilitiesQueryDto } from './dto/nearby-facilities-query.dto';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post('/add')
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilitiesService.create(createFacilityDto);
  }

  @Get()
  findAll(
    @Query('state') state?: string,
    @Query('lga') lga?: string,
    @Query('facilityType') facilityType?: string,
    @Query('ownership') ownership?: string,
    @Query('next') next?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const filters = { state, lga, facilityType, ownership };
    return this.facilitiesService.findAll(filters, next, pageSize);
  }

  @Get('nearby')
  findNearby(@Query() query: NearbyFacilitiesQueryDto) {
    return this.facilitiesService.findNearby(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ) {
    return this.facilitiesService.update(id, updateFacilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facilitiesService.remove(id);
  }
}
