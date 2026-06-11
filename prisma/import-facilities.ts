import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Prisma, PrismaClient } from '@prisma/client';

type SourceFacility = {
  facility_id: string | null;
  facility_name: string | null;
  facility_type: string | null;
  facility_level: string | null;
  state: string | null;
  lga: string | null;
  ward: string | null;
  latitude: number | null;
  longitude: number | null;
  has_coordinates: boolean | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  ceo_name: string | null;
  services_offered: string[] | null;
  ownership: string | null;
  data_source: string | null;
  last_verified: string | null;
  accessibility_score: number | null;
  verification_status: string | null;
};

type SourceFile = {
  metadata?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  facilities: SourceFacility[];
};

const BATCH_SIZE = 1000;

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileArg = args.find((arg) => !arg.startsWith('--'));

  return {
    dryRun,
    filePath: resolve(process.cwd(), fileArg ?? 'cleaned.json'),
  };
}

function requiredString(value: string | null, field: string, index: number) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Record ${index} is missing required field: ${field}`);
  }

  return value.trim();
}

function optionalString(value: string | null) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function optionalNumber(value: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function optionalDate(value: string | null, index: number) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Record ${index} has invalid last_verified date: ${value}`);
  }

  return date;
}

function mapFacility(
  facility: SourceFacility,
  index: number,
): Prisma.FacilityCreateManyInput {
  const latitude = optionalNumber(facility.latitude);
  const longitude = optionalNumber(facility.longitude);

  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    throw new Error(`Record ${index} has invalid latitude: ${latitude}`);
  }

  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    throw new Error(`Record ${index} has invalid longitude: ${longitude}`);
  }

  if (
    facility.services_offered !== null &&
    !Array.isArray(facility.services_offered)
  ) {
    throw new Error(`Record ${index} services_offered must be an array`);
  }

  return {
    facilityId: optionalString(facility.facility_id),
    facilityName: requiredString(
      facility.facility_name,
      'facility_name',
      index,
    ),
    facilityType: optionalString(facility.facility_type),
    facilityLevel: optionalString(facility.facility_level),
    state: requiredString(facility.state, 'state', index),
    lga: requiredString(facility.lga, 'lga', index),
    ward: optionalString(facility.ward),
    latitude,
    longitude,
    address: optionalString(facility.address),
    phone: optionalString(facility.phone),
    email: optionalString(facility.email),
    website: optionalString(facility.website),
    ceoName: optionalString(facility.ceo_name),
    servicesOffered: facility.services_offered ?? [],
    ownership: optionalString(facility.ownership),
    dataSource: optionalString(facility.data_source),
    lastVerified: optionalDate(facility.last_verified, index),
    accessibilityScore: optionalNumber(facility.accessibility_score),
    verificationStatus: optionalString(facility.verification_status),
  };
}

async function main() {
  loadEnvFile();

  const { dryRun, filePath } = parseArgs();
  const file = JSON.parse(readFileSync(filePath, 'utf8')) as SourceFile;

  if (!Array.isArray(file.facilities)) {
    throw new Error('Expected cleaned JSON to contain a facilities array');
  }

  const facilities = file.facilities.map(mapFacility);
  const uniqueFacilityIds = new Set(
    facilities
      .map((facility) => facility.facilityId)
      .filter((facilityId): facilityId is string => Boolean(facilityId)),
  );
  const duplicateFacilityIds = facilities.length - uniqueFacilityIds.size;

  console.log(`Loaded ${facilities.length} facilities from ${filePath}`);
  console.log(`Unique facility IDs: ${uniqueFacilityIds.size}`);
  console.log(`Duplicate or missing facility IDs: ${duplicateFacilityIds}`);

  if (dryRun) {
    console.log('Dry run complete. No records were inserted.');
    return;
  }

  const prisma = new PrismaClient();
  let inserted = 0;

  try {
    for (let index = 0; index < facilities.length; index += BATCH_SIZE) {
      const batch = facilities.slice(index, index + BATCH_SIZE);

      const result = await prisma.facility.createMany({
        data: batch,
        skipDuplicates: true,
      });

      inserted += result.count;
      console.log(
        `Imported ${Math.min(index + BATCH_SIZE, facilities.length)}/${facilities.length} records`,
      );
    }

    console.log(`Inserted ${inserted} new facilities.`);
    console.log('Duplicate facility IDs already in the database were skipped.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
