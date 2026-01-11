import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyBarnAccess } from '@/lib/auth';

// GET /api/barns/[barnId]/horses/suggestions - Get unique values for autocomplete
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barnId: string }> }
) {
  try {
    const { barnId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await verifyBarnAccess(user.id, barnId);
    if (!access) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all horses in the barn to extract unique values
    const horses = await prisma.horse.findMany({
      where: { barnId: barnId },
      select: {
        breed: true,
        color: true,
        ownerName: true,
        markings: true,
      },
    });

    // Extract unique non-null values
    const breeds = Array.from(new Set(horses.map(h => h.breed).filter((x): x is string => !!x))).sort();
    const colors = Array.from(new Set(horses.map(h => h.color).filter((x): x is string => !!x))).sort();
    const owners = Array.from(new Set(horses.map(h => h.ownerName).filter((x): x is string => !!x))).sort();
    const markings = Array.from(new Set(horses.map(h => h.markings).filter((x): x is string => !!x))).sort();

    // Common horse breeds to supplement user data
    const commonBreeds = [
      'American Quarter Horse',
      'Arabian',
      'Appaloosa',
      'Clydesdale',
      'Dutch Warmblood',
      'Friesian',
      'Hanoverian',
      'Morgan',
      'Mustang',
      'Oldenburg',
      'Paint',
      'Percheron',
      'Saddlebred',
      'Standardbred',
      'Tennessee Walker',
      'Thoroughbred',
      'Warmblood',
      'Welsh Pony',
    ];

    // Common horse colors
    const commonColors = [
      'Bay',
      'Black',
      'Buckskin',
      'Chestnut',
      'Cremello',
      'Dun',
      'Gray',
      'Grullo',
      'Palomino',
      'Pinto',
      'Roan',
      'Sorrel',
      'White',
    ];

    // Common markings
    const commonMarkings = [
      'Blaze',
      'Star',
      'Stripe',
      'Snip',
      'Bald Face',
      'Four White Socks',
      'Three White Socks',
      'Two White Socks',
      'One White Sock',
      'Coronet',
      'Pastern',
      'Stocking',
      'No Markings',
    ];

    // Merge and deduplicate, prioritizing barn's own data
    const allBreeds = Array.from(new Set([...breeds, ...commonBreeds])).sort();
    const allColors = Array.from(new Set([...colors, ...commonColors])).sort();
    const allMarkings = Array.from(new Set([...markings, ...commonMarkings])).sort();

    return NextResponse.json({
      data: {
        breeds: allBreeds,
        colors: allColors,
        owners: owners, // Only from barn data
        markings: allMarkings,
      },
    });
  } catch (error) {
    console.error('Error fetching horse suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
