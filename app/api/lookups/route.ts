import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { jobDomains, careerLevels, saudiCities } from '@/shared/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const [domains, levels, cities] = await Promise.all([
      db.select().from(jobDomains).orderBy(asc(jobDomains.sortOrder)),
      db.select().from(careerLevels).orderBy(asc(careerLevels.sortOrder)),
      db.select().from(saudiCities).orderBy(asc(saudiCities.sortOrder)),
    ]);

    return NextResponse.json({
      jobDomains: domains,
      careerLevels: levels,
      saudiCities: cities,
    });
  } catch (error) {
    console.error('Error fetching lookups:', error);
    return NextResponse.json({ error: 'Failed to fetch lookup data' }, { status: 500 });
  }
}
