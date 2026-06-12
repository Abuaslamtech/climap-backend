import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class NearbyFacilitiesQueryDto {
  @IsLatitude()
  latitude: string;

  @IsLongitude()
  longitude: string;

  @IsOptional()
  @IsString()
  radiusKm?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;

  @IsOptional()
  @IsString()
  next?: string;

  @IsOptional()
  @IsString()
  facilityType?: string;

  @IsOptional()
  @IsString()
  ownership?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  lga?: string;
}
