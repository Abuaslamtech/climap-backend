import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsDate, IsEmail, IsUrl } from 'class-validator';

export class CreateFacilityDto {
  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsString()
  facilityName: string;

  @IsOptional()
  @IsString()
  facilityType?: string;

  @IsOptional()
  @IsString()
  facilityLevel?: string;

  @IsString()
  state: string;

  @IsString()
  lga: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  hasCoordinates?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  ceoName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicesOffered?: string[];

  @IsOptional()
  @IsString()
  ownership?: string;

  @IsOptional()
  @IsString()
  dataSource?: string;

  @IsOptional()
  @IsDate()
  lastVerified?: Date;

  @IsOptional()
  @IsNumber()
  accessibilityScore?: number;

  @IsOptional()
  @IsString()
  verificationStatus?: string;
}
