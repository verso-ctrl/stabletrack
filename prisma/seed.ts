import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to safely delete from a table
async function safeDelete(model: any, name: string) {
  try {
    if (model && typeof model.deleteMany === 'function') {
      await model.deleteMany({});
    }
  } catch (e) {
    console.log(`  Skipping ${name} (table may not exist)`);
  }
}

async function main() {
  console.log('🌱 Seeding demo database...');
  
  // Clean up existing data first (for re-runs)
  console.log('🧹 Cleaning existing data...');
  
  // Use raw SQL to clear all tables (SQLite)
  const tables = [
    'Competition', 'RecurringInvoiceItem', 'RecurringInvoice', 'Reminder', 'Lesson', 'TrainingLog',
    'Payment', 'InvoiceItem', 'Invoice', 'ServiceLog', 'Service', 'ClientHorse', 'Client',
    'Coggins', 'ActivityLog', 'Task', 'EventReminder', 'Event', 'MedicationLog', 'Medication',
    'HealthAttachment', 'HealthRecord', 'Vaccination', 'WeightRecord', 'FeedLog', 
    'FeedProgramItem', 'FeedProgram', 'Document', 'Note', 'HorsePhoto', 'HorseTurnout',
    'HorseAccess', 'Horse', 'InventoryItem', 'Supplement', 'FeedType', 'Paddock', 'Stall',
    'BarnMember', 'Barn', 'Subscription', 'User', 'DailyHealthCheck', 'WaterLog', 'ClientHorse', 'Client'
  ];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
    } catch (e) {
      // Table might not exist, that's ok
    }
  }

  // Create demo user
  const user = await prisma.user.create({
    data: {
      id: 'demo-user-001',
      email: 'demo@stabletrack.com',
      firstName: 'Demo',
      lastName: 'User',
      subscription: {
        create: {
          tier: 'FARM',
          status: 'ACTIVE',
          maxHorses: 999,
          maxBarns: 10,
          storageGb: 50,
        },
      },
    },
  });
  console.log('✅ Created demo user');

  // Create demo barn
  const barn = await prisma.barn.create({
    data: {
      name: 'Willowbrook Farm',
      address: '1234 Pasture Lane',
      city: 'Lexington',
      state: 'KY',
      zipCode: '40502',
      inviteCode: 'DEMO-BARN',
      phone: '555-123-4567',
      email: 'info@willowbrook.example',
    },
  });
  console.log('✅ Created demo barn');

  // Add user as barn owner
  await prisma.barnMember.create({
    data: {
      userId: user.id,
      barnId: barn.id,
      role: 'OWNER',
    },
  });
  console.log('✅ Added user as barn owner');

  // Create feed types
  const grain = await prisma.feedType.create({
    data: {
      barnId: barn.id,
      name: 'Performance Plus Grain',
      brand: 'Purina',
      category: 'grain',
      unit: 'lbs',
      costPerUnit: 0.45,
    },
  });

  const timothyHay = await prisma.feedType.create({
    data: {
      barnId: barn.id,
      name: 'Timothy Hay',
      category: 'hay',
      unit: 'flakes',
      costPerUnit: 0.80,
    },
  });

  await prisma.feedType.create({
    data: {
      barnId: barn.id,
      name: 'Alfalfa Hay',
      category: 'hay',
      unit: 'flakes',
      costPerUnit: 1.00,
    },
  });
  console.log('✅ Created feed types');

  // Create supplements
  const jointSupplement = await prisma.supplement.create({
    data: {
      barnId: barn.id,
      name: 'Joint Supplement',
      brand: 'SmartPak',
      unit: 'scoops',
      costPerUnit: 1.50,
    },
  });

  await prisma.supplement.create({
    data: {
      barnId: barn.id,
      name: 'Electrolytes',
      brand: 'Apple-A-Day',
      unit: 'scoops',
      costPerUnit: 0.75,
    },
  });
  console.log('✅ Created supplements');

  // Create stalls
  const stallNames = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2'];
  for (const name of stallNames) {
    await prisma.stall.create({
      data: {
        barnId: barn.id,
        name,
        section: name.charAt(0),
      },
    });
  }
  console.log('✅ Created stalls');

  // Create paddocks
  await prisma.paddock.create({
    data: { barnId: barn.id, name: 'North Pasture', acreage: 5.0, maxHorses: 8 },
  });
  await prisma.paddock.create({
    data: { barnId: barn.id, name: 'South Paddock', acreage: 2.0, maxHorses: 4 },
  });
  await prisma.paddock.create({
    data: { barnId: barn.id, name: 'Round Pen', acreage: 0.25, maxHorses: 1 },
  });
  console.log('✅ Created paddocks');

  // Get stalls for horses
  const stallA1 = await prisma.stall.findUnique({ where: { barnId_section_name: { barnId: barn.id, section: 'Main Barn', name: 'A1' } } });
  const stallA2 = await prisma.stall.findUnique({ where: { barnId_section_name: { barnId: barn.id, section: 'Main Barn', name: 'A2' } } });
  const stallB1 = await prisma.stall.findUnique({ where: { barnId_section_name: { barnId: barn.id, section: 'Main Barn', name: 'B1' } } });
  const stallB2 = await prisma.stall.findUnique({ where: { barnId_section_name: { barnId: barn.id, section: 'Main Barn', name: 'B2' } } });
  const stallC1 = await prisma.stall.findUnique({ where: { barnId_section_name: { barnId: barn.id, section: 'Main Barn', name: 'C1' } } });

  // Create horses
  const thunder = await prisma.horse.create({
    data: {
      barnId: barn.id,
      barnName: 'Thunder',
      registeredName: 'Thunder\'s Lightning Strike',
      breed: 'Thoroughbred',
      color: 'Bay',
      dateOfBirth: new Date('2018-04-15'),
      sex: 'GELDING',
      heightHands: 16.2,
      microchipNumber: '985121012345678',
      status: 'ACTIVE',
      ownerName: 'Sarah Johnson',
      bio: 'Former racehorse, now excelling in hunter/jumper',
      stallId: stallA1?.id,
    },
  });

  const moonlight = await prisma.horse.create({
    data: {
      barnId: barn.id,
      barnName: 'Moonlight',
      registeredName: 'Midnight Moonlight',
      breed: 'Arabian',
      color: 'Grey',
      dateOfBirth: new Date('2016-06-20'),
      sex: 'MARE',
      heightHands: 15.1,
      status: 'ACTIVE',
      ownerName: 'Emily Chen',
      bio: 'Elegant mare with excellent endurance',
      stallId: stallA2?.id,
    },
  });

  const storm = await prisma.horse.create({
    data: {
      barnId: barn.id,
      barnName: 'Storm',
      registeredName: 'Storm Chaser',
      breed: 'Warmblood',
      color: 'Black',
      dateOfBirth: new Date('2019-03-10'),
      sex: 'GELDING',
      heightHands: 17.0,
      status: 'LAYUP',
      ownerName: 'Michael Roberts',
      bio: 'Recovering from soft tissue injury',
      stallId: stallB1?.id,
    },
  });

  const bella = await prisma.horse.create({
    data: {
      barnId: barn.id,
      barnName: 'Bella',
      registeredName: 'Southern Belle',
      breed: 'Quarter Horse',
      color: 'Sorrel',
      dateOfBirth: new Date('2015-08-05'),
      sex: 'MARE',
      heightHands: 15.0,
      status: 'ACTIVE',
      ownerName: 'Jessica Williams',
      bio: 'Steady lesson horse, great with beginners',
      stallId: stallB2?.id,
    },
  });

  const duke = await prisma.horse.create({
    data: {
      barnId: barn.id,
      barnName: 'Duke',
      registeredName: 'Duke of Wellington',
      breed: 'Hanoverian',
      color: 'Chestnut',
      dateOfBirth: new Date('2017-05-12'),
      sex: 'GELDING',
      heightHands: 16.3,
      status: 'ACTIVE',
      ownerName: 'David Miller',
      bio: 'Competitive dressage prospect',
      stallId: stallC1?.id,
    },
  });
  console.log('✅ Created 5 horses');

  // Create weight records
  const horses = [thunder, moonlight, storm, bella, duke];
  const weights = [1150, 950, 1250, 1050, 1200];
  
  for (let i = 0; i < horses.length; i++) {
    await prisma.weightRecord.create({
      data: {
        horseId: horses[i].id,
        weightLbs: weights[i],
        bodyCondition: 5 + Math.floor(Math.random() * 2),
        date: new Date(),
      },
    });
  }
  console.log('✅ Created weight records');

  // Create vaccinations
  const vaccineTypes = ['RABIES', 'EWT', 'FLU_RHINO', 'WEST_NILE'];
  for (const horse of horses) {
    for (const type of vaccineTypes) {
      await prisma.vaccination.create({
        data: {
          horseId: horse.id,
          type,
          dateGiven: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          nextDueDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // ~9 months from now
          veterinarian: 'Dr. Martinez',
        },
      });
    }
  }
  console.log('✅ Created vaccinations');

  // Create feed programs for each horse
  for (const horse of horses) {
    const program = await prisma.feedProgram.create({
      data: {
        horseId: horse.id,
        name: `${horse.barnName}'s Feed Program`,
        instructions: 'Split grain into AM/PM feedings. Hay available throughout the day.',
      },
    });

    // Add feed items
    await prisma.feedProgramItem.create({
      data: {
        feedProgramId: program.id,
        feedTypeId: grain.id,
        amount: 4,
        unit: 'lbs',
        feedingTime: 'AM',
      },
    });

    await prisma.feedProgramItem.create({
      data: {
        feedProgramId: program.id,
        feedTypeId: grain.id,
        amount: 4,
        unit: 'lbs',
        feedingTime: 'PM',
      },
    });

    await prisma.feedProgramItem.create({
      data: {
        feedProgramId: program.id,
        feedTypeId: timothyHay.id,
        amount: 4,
        unit: 'flakes',
        feedingTime: 'ALL',
      },
    });
  }
  console.log('✅ Created feed programs');

  // Add medications for Storm (layup horse)
  const buteMed = await prisma.medication.create({
    data: {
      horseId: storm.id,
      name: 'Bute (Phenylbutazone)',
      dosage: '1g',
      frequency: 'Twice daily',
      route: 'Oral',
      prescribingVet: 'Dr. Martinez',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      instructions: 'Give with grain. Monitor for GI upset.',
    },
  });

  await prisma.medication.create({
    data: {
      horseId: storm.id,
      name: 'GastroGard (Omeprazole)',
      dosage: '1 tube',
      frequency: 'Once daily',
      route: 'Oral',
      prescribingVet: 'Dr. Martinez',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      instructions: 'Give on empty stomach, 1 hour before feeding.',
    },
  });

  // Add medication log entries
  await prisma.medicationLog.createMany({
    data: [
      {
        medicationId: buteMed.id,
        givenAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        givenBy: 'Demo User',
        skipped: false,
      },
      {
        medicationId: buteMed.id,
        givenAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        givenBy: 'Demo User',
        skipped: false,
      },
      {
        medicationId: buteMed.id,
        givenAt: new Date(),
        givenBy: 'Demo User',
        skipped: false,
        notes: 'Ate all grain with medication',
      },
    ],
  });

  await prisma.healthRecord.create({
    data: {
      horseId: storm.id,
      type: 'INJURY',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      provider: 'Dr. Martinez',
      diagnosis: 'Mild suspensory strain - left front',
      treatment: 'Stall rest, controlled hand walking, ice therapy',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      followUpNotes: 'Re-ultrasound in 2 weeks',
    },
  });
  console.log('✅ Created Storm\'s medical records');

  // Create upcoming events
  await prisma.event.create({
    data: {
      barnId: barn.id,
      type: 'FARRIER',
      title: 'Farrier Visit - All Horses',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      providerName: 'Mike Johnson',
      providerPhone: '555-234-5678',
      farrierWork: 'Trim and reset',
    },
  });

  await prisma.event.create({
    data: {
      barnId: barn.id,
      horseId: storm.id,
      type: 'VET_APPOINTMENT',
      title: 'Storm - Recheck Ultrasound',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      providerName: 'Dr. Martinez',
      providerPhone: '555-345-6789',
    },
  });

  await prisma.event.create({
    data: {
      barnId: barn.id,
      horseId: moonlight.id,
      type: 'DENTAL',
      title: 'Moonlight - Annual Dental',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      providerName: 'Dr. Patterson',
    },
  });

  await prisma.event.create({
    data: {
      barnId: barn.id,
      type: 'DEWORMING',
      title: 'Barn-Wide Deworming',
      scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      dewormProduct: 'Ivermectin',
    },
  });
  console.log('✅ Created events');

  // Create tasks
  await prisma.task.create({
    data: {
      barnId: barn.id,
      title: 'Morning Feeding',
      description: 'Feed all horses according to their feed programs',
      dueTime: '06:30',
      priority: 'HIGH',
      isRecurring: true,
      recurringRule: 'FREQ=DAILY',
    },
  });

  await prisma.task.create({
    data: {
      barnId: barn.id,
      title: 'Evening Feeding',
      description: 'Feed all horses according to their feed programs',
      dueTime: '17:30',
      priority: 'HIGH',
      isRecurring: true,
      recurringRule: 'FREQ=DAILY',
    },
  });

  await prisma.task.create({
    data: {
      barnId: barn.id,
      title: 'Cold hose Storm',
      description: 'Cold hose left front for 20 minutes',
      dueTime: '10:00',
      priority: 'MEDIUM',
    },
  });

  await prisma.task.create({
    data: {
      barnId: barn.id,
      title: 'Clean water buckets',
      description: 'Scrub and refill all water buckets',
      priority: 'MEDIUM',
    },
  });

  await prisma.task.create({
    data: {
      barnId: barn.id,
      title: 'Order hay',
      description: 'Running low on timothy - order 50 bales',
      priority: 'LOW',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created tasks');

  // Create activity log
  await prisma.activityLog.create({
    data: {
      barnId: barn.id,
      userId: user.id,
      type: 'HORSE_CREATED',
      description: 'Added 5 horses to the barn',
    },
  });
  console.log('✅ Created activity log');

  // ============================================================================
  // NEW FEATURES: Services, Clients, Invoicing, Coggins, Training, Lessons
  // These features require additional models only available in PostgreSQL schema
  // ============================================================================
  
  try {
    // Cast to any to avoid TypeScript errors for models not in SQLite schema
    const db = prisma as any;
    
    // Create services catalog
    const boardService = await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Full Board',
      description: 'Full care board including feed, turnout, and stall cleaning',
      category: 'BOARD',
      price: 1200,
      unit: 'month',
    },
  });

  const trainingService = await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Training Ride',
      description: '30-45 minute training session',
      category: 'TRAINING',
      price: 55,
      unit: 'session',
    },
  });

  const lessonService = await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Private Lesson',
      description: '60 minute private riding lesson',
      category: 'LESSONS',
      price: 75,
      unit: 'hour',
    },
  });

  await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Group Lesson',
      description: '60 minute group lesson (2-4 riders)',
      category: 'LESSONS',
      price: 50,
      unit: 'hour',
    },
  });

  await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Blanketing',
      description: 'Daily blanket changes',
      category: 'OTHER',
      price: 5,
      unit: 'day',
    },
  });

  await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Extra Shavings',
      description: 'Additional bedding as needed',
      category: 'SUPPLIES',
      price: 15,
      unit: 'each',
    },
  });

  await db.service.create({
    data: {
      barnId: barn.id,
      name: 'Medication Administration',
      description: 'Administering owner-supplied medication',
      category: 'VET',
      price: 25,
      unit: 'day',
    },
  });
  console.log('✅ Created services catalog');

  // Get horses for client assignment
  const horsesForClients = await prisma.horse.findMany({
    where: { barnId: barn.id },
    take: 3,
  });

  // Create clients
  const client1 = await db.client.create({
    data: {
      barnId: barn.id,
      email: 'sarah.johnson@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '555-234-5678',
      address: '456 Oak Street',
      city: 'Lexington',
      state: 'KY',
      zipCode: '40503',
      portalEnabled: true,
      portalToken: 'demo-portal-token-sarah-johnson',
      horses: horsesForClients.length > 0 ? {
        create: {
          horseId: horsesForClients[0].id,
          isPrimary: true,
        },
      } : undefined,
    },
  });

  const client2 = await db.client.create({
    data: {
      barnId: barn.id,
      email: 'mike.williams@example.com',
      firstName: 'Mike',
      lastName: 'Williams',
      phone: '555-345-6789',
      address: '789 Maple Ave',
      city: 'Lexington',
      state: 'KY',
      zipCode: '40504',
      portalEnabled: true,
      portalToken: 'demo-portal-token-mike-williams',
      horses: horsesForClients.length > 1 ? {
        create: {
          horseId: horsesForClients[1].id,
          isPrimary: true,
        },
      } : undefined,
    },
  });

  const client3 = await db.client.create({
    data: {
      barnId: barn.id,
      email: 'lisa.chen@example.com',
      firstName: 'Lisa',
      lastName: 'Chen',
      phone: '555-456-7890',
      portalEnabled: false,
      horses: horsesForClients.length > 2 ? {
        create: {
          horseId: horsesForClients[2].id,
          isPrimary: true,
        },
      } : undefined,
    },
  });
  console.log('✅ Created clients');

  // Create invoices
  const invoice1 = await db.invoice.create({
    data: {
      barnId: barn.id,
      clientId: client1.id,
      invoiceNumber: 'INV1001',
      status: 'PAID',
      issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      subtotal: 1385,
      tax: 0,
      total: 1385,
      amountPaid: 1385,
      paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            description: 'Full Board - December',
            quantity: 1,
            unitPrice: 1200,
            total: 1200,
            serviceId: boardService.id,
            horseId: horsesForClients[0]?.id,
          },
          {
            description: 'Training Rides (x3)',
            quantity: 3,
            unitPrice: 55,
            total: 165,
            serviceId: trainingService.id,
            horseId: horsesForClients[0]?.id,
          },
          {
            description: 'Extra Shavings',
            quantity: 1,
            unitPrice: 20,
            total: 20,
          },
        ],
      },
      payments: {
        create: {
          amount: 1385,
          method: 'CHECK',
          reference: 'Check #4521',
          paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const invoice2 = await db.invoice.create({
    data: {
      barnId: barn.id,
      clientId: client1.id,
      invoiceNumber: 'INV1002',
      status: 'SENT',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      subtotal: 1310,
      tax: 0,
      total: 1310,
      amountPaid: 0,
      sentAt: new Date(),
      items: {
        create: [
          {
            description: 'Full Board - January',
            quantity: 1,
            unitPrice: 1200,
            total: 1200,
            serviceId: boardService.id,
            horseId: horsesForClients[0]?.id,
          },
          {
            description: 'Training Rides (x2)',
            quantity: 2,
            unitPrice: 55,
            total: 110,
            serviceId: trainingService.id,
            horseId: horsesForClients[0]?.id,
          },
        ],
      },
    },
  });

  const invoice3 = await db.invoice.create({
    data: {
      barnId: barn.id,
      clientId: client2.id,
      invoiceNumber: 'INV1003',
      status: 'OVERDUE',
      issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      subtotal: 1200,
      tax: 0,
      total: 1200,
      amountPaid: 600,
      items: {
        create: [
          {
            description: 'Full Board - December',
            quantity: 1,
            unitPrice: 1200,
            total: 1200,
            serviceId: boardService.id,
            horseId: horsesForClients[1]?.id,
          },
        ],
      },
      payments: {
        create: {
          amount: 600,
          method: 'CREDIT_CARD',
          reference: 'Partial payment',
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });
  console.log('✅ Created invoices');

  // Update barn invoice settings
  await db.barn.update({
    where: { id: barn.id },
    data: {
      invoicePrefix: 'INV',
      nextInvoiceNumber: 1004,
      defaultPaymentTerms: 15,
      taxRate: 0,
    },
  });

  // Create Coggins records for horses
  if (horsesForClients.length > 0) {
    await db.coggins.create({
      data: {
        horseId: horsesForClients[0].id,
        testDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        result: 'NEGATIVE',
        veterinarian: 'Dr. Smith',
        labName: 'Kentucky Equine Lab',
        accessionNumber: 'KEL-2024-5678',
      },
    });

    if (horsesForClients.length > 1) {
      await db.coggins.create({
        data: {
          horseId: horsesForClients[1].id,
          testDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
          result: 'NEGATIVE',
          veterinarian: 'Dr. Jones',
          labName: 'Lexington Animal Health',
          accessionNumber: 'LAH-2024-1234',
        },
      });
    }

    // One expired coggins
    if (horsesForClients.length > 2) {
      await db.coggins.create({
        data: {
          horseId: horsesForClients[2].id,
          testDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          result: 'NEGATIVE',
          veterinarian: 'Dr. Smith',
          labName: 'Kentucky Equine Lab',
          accessionNumber: 'KEL-2023-9999',
        },
      });
    }
  }
  console.log('✅ Created Coggins records');

  // Create training logs
  const trainingLogDates = [
    { daysAgo: 1, type: 'FLATWORK', duration: 45, rating: 4 },
    { daysAgo: 2, type: 'JUMPING', duration: 40, rating: 5 },
    { daysAgo: 3, type: 'HACK', duration: 60, rating: 4 },
    { daysAgo: 5, type: 'TRAINING_RIDE', duration: 35, rating: 3 },
    { daysAgo: 6, type: 'GROUNDWORK', duration: 30, rating: 4 },
    { daysAgo: 8, type: 'FLATWORK', duration: 45, rating: 5 },
  ];

  for (const log of trainingLogDates) {
    if (horsesForClients.length > 0) {
      await db.trainingLog.create({
        data: {
          barnId: barn.id,
          horseId: horsesForClients[Math.floor(Math.random() * Math.min(horsesForClients.length, 2))].id,
          type: log.type,
          date: new Date(Date.now() - log.daysAgo * 24 * 60 * 60 * 1000),
          duration: log.duration,
          discipline: 'HUNTER',
          location: log.type === 'HACK' ? 'Trails' : 'Indoor Arena',
          goals: log.type === 'FLATWORK' ? 'Work on bend and suppleness' : 
                 log.type === 'JUMPING' ? 'Grid work and adjustability' :
                 log.type === 'HACK' ? 'Fitness and relaxation' : 'General training',
          rating: log.rating,
          trainerId: user.id,
        },
      });
    }
  }
  console.log('✅ Created training logs');

  // Create lessons
  const lessonData = [
    { daysFromNow: 1, hour: 9, type: 'PRIVATE', duration: 60 },
    { daysFromNow: 1, hour: 14, type: 'GROUP', duration: 60 },
    { daysFromNow: 2, hour: 10, type: 'PRIVATE', duration: 45 },
    { daysFromNow: 3, hour: 11, type: 'PRIVATE', duration: 60 },
    { daysFromNow: 5, hour: 15, type: 'SEMI_PRIVATE', duration: 60 },
    { daysFromNow: -2, hour: 10, type: 'PRIVATE', duration: 60, status: 'COMPLETED' },
    { daysFromNow: -5, hour: 14, type: 'GROUP', duration: 60, status: 'COMPLETED' },
  ];

  for (let i = 0; i < lessonData.length; i++) {
    const lesson = lessonData[i];
    const lessonDate = new Date();
    lessonDate.setDate(lessonDate.getDate() + lesson.daysFromNow);
    lessonDate.setHours(lesson.hour, 0, 0, 0);

    await db.lesson.create({
      data: {
        barnId: barn.id,
        clientId: i % 3 === 0 ? client1.id : i % 3 === 1 ? client2.id : client3.id,
        horseId: horsesForClients.length > 0 ? horsesForClients[i % horsesForClients.length].id : null,
        type: lesson.type,
        status: lesson.status || 'SCHEDULED',
        scheduledDate: lessonDate,
        duration: lesson.duration,
        discipline: 'HUNTER',
        level: i % 2 === 0 ? 'INTERMEDIATE' : 'BEGINNER',
        price: lesson.type === 'PRIVATE' ? 75 : lesson.type === 'GROUP' ? 50 : 60,
        location: 'Indoor Arena',
        completedAt: lesson.status === 'COMPLETED' ? lessonDate : null,
      },
    });
  }
  console.log('✅ Created lessons');

  // Create Recurring Invoices
  console.log('📋 Creating recurring invoices...');
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);

  // Monthly board for Sarah (Thunder)
  await db.recurringInvoice.create({
    data: {
      barnId: barn.id,
      clientId: client1.id,
      name: 'Monthly Board - Thunder',
      frequency: 'MONTHLY',
      dayOfMonth: 1,
      startDate: new Date(),
      nextRunDate: nextMonth,
      isActive: true,
      autoSend: true,
      notes: 'Monthly full board for Thunder',
      items: {
        create: [
          {
            serviceId: boardService.id,
            description: 'Full Board - Thunder',
            quantity: 1,
            unitPrice: 1200,
          },
          {
            serviceId: trainingService.id,
            description: 'Training Rides (4x/week)',
            quantity: 16,
            unitPrice: 55,
          },
        ],
      },
    },
  });

  // Monthly board for Mike (Moonlight)
  await db.recurringInvoice.create({
    data: {
      barnId: barn.id,
      clientId: client2.id,
      name: 'Monthly Board - Moonlight',
      frequency: 'MONTHLY',
      dayOfMonth: 1,
      startDate: new Date(),
      nextRunDate: nextMonth,
      isActive: true,
      autoSend: false,
      notes: 'Monthly full board for Moonlight',
      items: {
        create: [
          {
            serviceId: boardService.id,
            description: 'Full Board - Moonlight',
            quantity: 1,
            unitPrice: 1200,
          },
        ],
      },
    },
  });

  console.log('✅ Created recurring invoices');

  // Create Competition Records
  console.log('🏆 Creating competition records...');
  
  await db.competition.createMany({
    data: [
      {
        barnId: barn.id,
        horseId: thunder.id,
        eventName: 'Spring Classic Horse Show',
        organization: 'USEF',
        eventDate: new Date('2025-03-15'),
        location: 'Wellington, FL',
        discipline: 'Jumper',
        className: 'Low Adult Jumper',
        level: '1.10m',
        placing: 1,
        totalEntries: 24,
        score: 0,
        faults: 0,
        points: 10,
        prizeMoney: 500,
        isChampion: false,
        isReserve: false,
        notes: 'Clear round, fastest time!',
      },
      {
        barnId: barn.id,
        horseId: thunder.id,
        eventName: 'Spring Classic Horse Show',
        organization: 'USEF',
        eventDate: new Date('2025-03-16'),
        location: 'Wellington, FL',
        discipline: 'Jumper',
        className: 'Medium Adult Jumper',
        level: '1.20m',
        placing: 3,
        totalEntries: 18,
        faults: 4,
        points: 6,
        prizeMoney: 150,
        isChampion: false,
        isReserve: false,
        notes: 'One rail down, good effort',
      },
      {
        barnId: barn.id,
        horseId: moonlight.id,
        eventName: 'Regional Dressage Championship',
        organization: 'USDF',
        eventDate: new Date('2025-04-10'),
        location: 'Lexington, KY',
        discipline: 'Dressage',
        className: 'Second Level Test 1',
        level: 'Second Level',
        placing: 2,
        totalEntries: 12,
        score: 68.5,
        points: 8,
        prizeMoney: 200,
        isChampion: false,
        isReserve: true,
        notes: 'Personal best score!',
      },
      {
        barnId: barn.id,
        horseId: moonlight.id,
        eventName: 'Summer Schooling Show',
        organization: 'Local',
        eventDate: new Date('2025-06-20'),
        location: 'Willowbrook Farm',
        discipline: 'Dressage',
        className: 'Training Level Test 3',
        level: 'Training Level',
        placing: 1,
        totalEntries: 8,
        score: 72.3,
        points: 4,
        isChampion: true,
        isReserve: false,
        notes: 'Division Champion',
      },
      {
        barnId: barn.id,
        horseId: duke.id,
        eventName: 'Fall Hunter Derby',
        organization: 'USHJA',
        eventDate: new Date('2025-10-05'),
        location: 'Devon, PA',
        discipline: 'Hunter',
        className: 'Adult Hunter 3\'',
        level: '3 foot',
        placing: 4,
        totalEntries: 32,
        score: 84,
        points: 4,
        isChampion: false,
        isReserve: false,
        isQualified: true,
        qualifiedFor: 'Zone Finals',
        notes: 'Qualified for Zone Finals!',
      },
    ],
  });

  console.log('✅ Created competition records');

  // Create Daily Health Checks (including one concerning)
  console.log('🩺 Creating health check records...');
  
  await db.dailyHealthCheck.createMany({
    data: [
      // Normal checks
      {
        horseId: thunder.id,
        date: new Date(),
        overallCondition: 'Good',
        appetite: 'Normal',
        manure: 'Normal',
        attitude: 'Bright & Alert',
        notes: 'Looking great, ready for training',
      },
      {
        horseId: moonlight.id,
        date: new Date(),
        overallCondition: 'Excellent',
        appetite: 'Normal',
        manure: 'Normal',
        attitude: 'Bright & Alert',
        notes: 'Very energetic today',
      },
      {
        horseId: duke.id,
        date: new Date(),
        overallCondition: 'Good',
        appetite: 'Normal',
        manure: 'Normal',
        attitude: 'Quiet',
        notes: 'Calm and relaxed',
      },
      // Concerning check - will trigger alert
      {
        horseId: storm.id, // Storm is on layup
        date: new Date(),
        overallCondition: 'Fair',
        appetite: 'Decreased',
        manure: 'Normal',
        attitude: 'Dull',
        notes: 'Not finishing hay, seems uncomfortable. Monitor closely.',
      },
    ],
  });

  console.log('✅ Created health check records');
  } catch (e) {
    // Service and Invoice models may not exist in SQLite schema
    console.log('⚠️  Skipped service/invoice features (models not in SQLite schema)');
  }

  // Create clients (separate try-catch since Client model exists in all schemas)
  try {
    const existingClients = await prisma.client.findMany({ where: { barnId: barn.id } });
    if (existingClients.length === 0) {
      const horsesForClients = await prisma.horse.findMany({
        where: { barnId: barn.id },
        take: 3,
      });

      const client1 = await prisma.client.create({
        data: {
          barnId: barn.id,
          email: 'sarah.johnson@example.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '555-234-5678',
          address: '456 Oak Street',
          city: 'Lexington',
          state: 'KY',
          zipCode: '40503',
          portalEnabled: true,
          portalToken: 'demo-portal-token-sarah-johnson',
        },
      });
      if (horsesForClients[0]) {
        await prisma.clientHorse.create({
          data: { clientId: client1.id, horseId: horsesForClients[0].id, isPrimary: true }
        });
      }

      const client2 = await prisma.client.create({
        data: {
          barnId: barn.id,
          email: 'mike.williams@example.com',
          firstName: 'Mike',
          lastName: 'Williams',
          phone: '555-345-6789',
          address: '789 Maple Ave',
          city: 'Lexington',
          state: 'KY',
          zipCode: '40504',
          portalEnabled: true,
          portalToken: 'demo-portal-token-mike-williams',
        },
      });
      if (horsesForClients[1]) {
        await prisma.clientHorse.create({
          data: { clientId: client2.id, horseId: horsesForClients[1].id, isPrimary: true }
        });
      }

      await prisma.client.create({
        data: {
          barnId: barn.id,
          email: 'lisa.chen@example.com',
          firstName: 'Lisa',
          lastName: 'Chen',
          phone: '555-456-7890',
          portalEnabled: false,
        },
      });
      console.log('✅ Created demo clients');
    } else {
      console.log('✅ Demo clients already exist');
    }
  } catch (e) {
    console.log('⚠️  Could not create clients:', e instanceof Error ? e.message : e);
  }

  console.log('');
  console.log('🎉 Demo database seeded successfully!');
  console.log('');
  console.log('Demo barn: Willowbrook Farm');
  console.log('Horses: Thunder, Moonlight, Storm (layup), Bella, Duke');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
