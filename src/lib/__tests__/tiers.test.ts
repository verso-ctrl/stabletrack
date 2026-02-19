import {
  normalizeTier,
  getNextTier,
  getTierLimits,
  getTierPricing,
  getTierFeatures,
  hasReachedPhotoLimit,
  hasReachedHorseLimit,
  hasReachedTeamMemberLimit,
  formatBytes,
  formatPrice,
  getTierDisplayName,
  wouldExceedStorageLimit,
} from '../tiers';

describe('normalizeTier', () => {
  it('maps FREE to STARTER', () => {
    expect(normalizeTier('FREE')).toBe('STARTER');
  });

  it('maps BASIC to STARTER', () => {
    expect(normalizeTier('BASIC')).toBe('STARTER');
  });

  it('maps CORE to STARTER', () => {
    expect(normalizeTier('CORE')).toBe('STARTER');
  });

  it('maps STARTER to STARTER', () => {
    expect(normalizeTier('STARTER')).toBe('STARTER');
  });

  it('maps ADVANCED to FARM', () => {
    expect(normalizeTier('ADVANCED')).toBe('FARM');
  });

  it('maps ENTERPRISE to FARM', () => {
    expect(normalizeTier('ENTERPRISE')).toBe('FARM');
  });

  it('maps PRO to FARM', () => {
    expect(normalizeTier('PRO')).toBe('FARM');
  });

  it('maps FARM to FARM', () => {
    expect(normalizeTier('FARM')).toBe('FARM');
  });

  it('maps garbage strings to STARTER', () => {
    expect(normalizeTier('garbage')).toBe('STARTER');
    expect(normalizeTier('UNKNOWN')).toBe('STARTER');
    expect(normalizeTier('')).toBe('STARTER');
  });

  it('is case-insensitive', () => {
    expect(normalizeTier('free')).toBe('STARTER');
    expect(normalizeTier('farm')).toBe('FARM');
    expect(normalizeTier('pro')).toBe('FARM');
    expect(normalizeTier('Advanced')).toBe('FARM');
  });
});

describe('getNextTier', () => {
  it('returns FARM for STARTER', () => {
    expect(getNextTier('STARTER')).toBe('FARM');
  });

  it('returns null for FARM', () => {
    expect(getNextTier('FARM')).toBeNull();
  });

  it('handles legacy tier names', () => {
    expect(getNextTier('FREE')).toBe('FARM');
    expect(getNextTier('BASIC')).toBe('FARM');
    expect(getNextTier('CORE')).toBe('FARM');
    expect(getNextTier('PRO')).toBeNull();
    expect(getNextTier('ADVANCED')).toBeNull();
    expect(getNextTier('ENTERPRISE')).toBeNull();
  });
});

describe('getTierLimits', () => {
  it('returns correct limits for STARTER', () => {
    const limits = getTierLimits('STARTER');
    expect(limits.maxHorses).toBe(10);
    expect(limits.maxTeamMembers).toBe(5);
    expect(limits.maxStorageBytes).toBe(10 * 1024 * 1024 * 1024);
    expect(limits.maxPhotosPerHorse).toBe(20);
  });

  it('returns unlimited for FARM', () => {
    const limits = getTierLimits('FARM');
    expect(limits.maxHorses).toBe(-1);
    expect(limits.maxTeamMembers).toBe(-1);
    expect(limits.maxStorageBytes).toBe(50 * 1024 * 1024 * 1024);
    expect(limits.maxPhotosPerHorse).toBe(-1);
  });
});

describe('getTierPricing', () => {
  it('returns correct prices for STARTER', () => {
    const pricing = getTierPricing('STARTER');
    expect(pricing.monthlyPriceCents).toBe(2500);
    expect(pricing.annualPriceCents).toBe(25000);
    expect(pricing.displayName).toBe('Starter');
  });

  it('returns correct prices for FARM', () => {
    const pricing = getTierPricing('FARM');
    expect(pricing.monthlyPriceCents).toBe(6000);
    expect(pricing.annualPriceCents).toBe(60000);
    expect(pricing.displayName).toBe('Farm');
    expect(pricing.popular).toBe(true);
  });
});

describe('getTierFeatures', () => {
  it('returns core features for STARTER', () => {
    const features = getTierFeatures('STARTER');
    expect(features.horseProfiles).toBe(true);
    expect(features.basicHealthRecords).toBe(true);
    expect(features.simpleCalendar).toBe(true);
    expect(features.canUploadPhotos).toBe(true);
    expect(features.taskManagement).toBe(true);
  });

  it('returns priority support for FARM', () => {
    const features = getTierFeatures('FARM');
    expect(features.prioritySupport).toBe(true);
  });

  it('STARTER does not have priority support', () => {
    const features = getTierFeatures('STARTER');
    expect(features.prioritySupport).toBe(false);
  });

  it('enables breeding management when add-on active', () => {
    const features = getTierFeatures('STARTER', ['breeding']);
    expect(features.breedingManagement).toBe(true);
  });

  it('breeding management disabled without add-on', () => {
    const features = getTierFeatures('STARTER');
    expect(features.breedingManagement).toBe(false);
  });
});

describe('hasReachedPhotoLimit', () => {
  it('returns true when STARTER horse has 20 photos', () => {
    expect(hasReachedPhotoLimit('STARTER', 20)).toBe(true);
  });

  it('returns false when STARTER horse has fewer than 20 photos', () => {
    expect(hasReachedPhotoLimit('STARTER', 19)).toBe(false);
  });

  it('returns false for FARM regardless of count', () => {
    expect(hasReachedPhotoLimit('FARM', 100)).toBe(false);
    expect(hasReachedPhotoLimit('FARM', 10000)).toBe(false);
  });
});

describe('hasReachedHorseLimit', () => {
  it('returns true when STARTER barn has 10 horses', () => {
    expect(hasReachedHorseLimit('STARTER', 10)).toBe(true);
  });

  it('returns false when STARTER barn has fewer than 10 horses', () => {
    expect(hasReachedHorseLimit('STARTER', 9)).toBe(false);
  });

  it('returns false for FARM regardless of count', () => {
    expect(hasReachedHorseLimit('FARM', 100)).toBe(false);
  });
});

describe('hasReachedTeamMemberLimit', () => {
  it('returns true when STARTER barn has 5 members', () => {
    expect(hasReachedTeamMemberLimit('STARTER', 5)).toBe(true);
  });

  it('returns false when STARTER barn has fewer than 5 members', () => {
    expect(hasReachedTeamMemberLimit('STARTER', 4)).toBe(false);
  });

  it('returns false for FARM regardless of count', () => {
    expect(hasReachedTeamMemberLimit('FARM', 50)).toBe(false);
  });
});

describe('wouldExceedStorageLimit', () => {
  it('returns true when adding file would exceed STARTER limit', () => {
    const tenGB = 10 * 1024 * 1024 * 1024;
    expect(wouldExceedStorageLimit('STARTER', tenGB - 100, 200)).toBe(true);
  });

  it('returns false when within STARTER limit', () => {
    expect(wouldExceedStorageLimit('STARTER', 0, 1024)).toBe(false);
  });
});

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats bytes as KB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('formats bytes as MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('formats bytes as GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('formats with decimal precision', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});

describe('formatPrice', () => {
  it('formats 0 as Free', () => {
    expect(formatPrice(0)).toBe('Free');
  });

  it('formats monthly price', () => {
    expect(formatPrice(2500)).toBe('$25/month');
  });

  it('formats annual price', () => {
    expect(formatPrice(25000, true)).toBe('$250/year');
  });
});

describe('getTierDisplayName', () => {
  it('returns Starter for STARTER', () => {
    expect(getTierDisplayName('STARTER')).toBe('Starter');
  });

  it('returns Farm for FARM', () => {
    expect(getTierDisplayName('FARM')).toBe('Farm');
  });

  it('handles legacy tier names', () => {
    expect(getTierDisplayName('FREE')).toBe('Starter');
    expect(getTierDisplayName('CORE')).toBe('Starter');
    expect(getTierDisplayName('PRO')).toBe('Farm');
    expect(getTierDisplayName('ADVANCED')).toBe('Farm');
  });
});
