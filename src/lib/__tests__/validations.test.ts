import {
  eventSchema,
  horseSchema,
  lessonSchema,
  userSchema,
  validate,
  formatValidationErrors,
} from '../validations';

describe('Event Validation', () => {
  it('should validate a valid event', () => {
    const validEvent = {
      type: 'VET_APPOINTMENT',
      title: 'Vet Visit',
      scheduledDate: '2024-01-15T10:00:00Z',
    };

    const result = validate(eventSchema, validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Vet Visit');
    }
  });

  it('should reject event without title', () => {
    const invalidEvent = {
      type: 'VET_APPOINTMENT',
      scheduledDate: '2024-01-15T10:00:00Z',
    };

    const result = validate(eventSchema, invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      expect(errors.title).toBeDefined();
    }
  });

  it('should reject event with invalid type', () => {
    const invalidEvent = {
      type: 'INVALID_TYPE',
      title: 'Test',
      scheduledDate: '2024-01-15T10:00:00Z',
    };

    const result = validate(eventSchema, invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should reject event with invalid date', () => {
    const invalidEvent = {
      type: 'VET_APPOINTMENT',
      title: 'Test',
      scheduledDate: 'not-a-date',
    };

    const result = validate(eventSchema, invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should reject negative cost', () => {
    const invalidEvent = {
      type: 'VET_APPOINTMENT',
      title: 'Test',
      scheduledDate: '2024-01-15T10:00:00Z',
      cost: -100,
    };

    const result = validate(eventSchema, invalidEvent);
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const validEvent = {
      type: 'VET_APPOINTMENT',
      title: 'Vet Visit',
      scheduledDate: '2024-01-15T10:00:00Z',
      description: 'Annual checkup',
      providerName: 'Dr. Smith',
      cost: 150.50,
    };

    const result = validate(eventSchema, validEvent);
    expect(result.success).toBe(true);
  });
});

describe('Horse Validation', () => {
  it('should validate a valid horse', () => {
    const validHorse = {
      barnName: 'Thunder',
      breed: 'Thoroughbred',
      sex: 'GELDING',
    };

    const result = validate(horseSchema, validHorse);
    expect(result.success).toBe(true);
  });

  it('should reject horse without barn name', () => {
    const invalidHorse = {
      breed: 'Thoroughbred',
    };

    const result = validate(horseSchema, invalidHorse);
    expect(result.success).toBe(false);
  });

  it('should reject invalid sex', () => {
    const invalidHorse = {
      barnName: 'Thunder',
      sex: 'INVALID',
    };

    const result = validate(horseSchema, invalidHorse);
    expect(result.success).toBe(false);
  });

  it('should reject negative height', () => {
    const invalidHorse = {
      barnName: 'Thunder',
      height: -10,
    };

    const result = validate(horseSchema, invalidHorse);
    expect(result.success).toBe(false);
  });

  it('should reject negative weight', () => {
    const invalidHorse = {
      barnName: 'Thunder',
      weight: -500,
    };

    const result = validate(horseSchema, invalidHorse);
    expect(result.success).toBe(false);
  });
});

describe('User Validation', () => {
  it('should validate a valid user', () => {
    const validUser = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = validate(userSchema, validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidUser = {
      email: 'not-an-email',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = validate(userSchema, invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject empty first name', () => {
    const invalidUser = {
      email: 'test@example.com',
      firstName: '',
      lastName: 'Doe',
    };

    const result = validate(userSchema, invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject too long names', () => {
    const invalidUser = {
      email: 'test@example.com',
      firstName: 'a'.repeat(51),
      lastName: 'Doe',
    };

    const result = validate(userSchema, invalidUser);
    expect(result.success).toBe(false);
  });
});

describe('Lesson Validation', () => {
  it('should validate a valid lesson', () => {
    const validLesson = {
      studentName: 'Jane Doe',
      horseId: 'horse123',
      scheduledDate: '2024-01-15T10:00:00Z',
      duration: 60,
      type: 'PRIVATE',
    };

    const result = validate(lessonSchema, validLesson);
    expect(result.success).toBe(true);
  });

  it('should reject lesson without student name', () => {
    const invalidLesson = {
      horseId: 'horse123',
      scheduledDate: '2024-01-15T10:00:00Z',
      duration: 60,
      type: 'PRIVATE',
    };

    const result = validate(lessonSchema, invalidLesson);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const invalidLesson = {
      studentName: 'Jane Doe',
      studentEmail: 'not-an-email',
      horseId: 'horse123',
      scheduledDate: '2024-01-15T10:00:00Z',
      duration: 60,
      type: 'PRIVATE',
    };

    const result = validate(lessonSchema, invalidLesson);
    expect(result.success).toBe(false);
  });

  it('should accept empty email', () => {
    const validLesson = {
      studentName: 'Jane Doe',
      studentEmail: '',
      horseId: 'horse123',
      scheduledDate: '2024-01-15T10:00:00Z',
      duration: 60,
      type: 'PRIVATE',
    };

    const result = validate(lessonSchema, validLesson);
    expect(result.success).toBe(true);
  });

  it('should reject negative price', () => {
    const invalidLesson = {
      studentName: 'Jane Doe',
      horseId: 'horse123',
      scheduledDate: '2024-01-15T10:00:00Z',
      duration: 60,
      type: 'PRIVATE',
      price: -50,
    };

    const result = validate(lessonSchema, invalidLesson);
    expect(result.success).toBe(false);
  });

  it('should reject zero duration', () => {
    const invalidLesson = {
      studentName: 'Jane Doe',
      horseId: 'horse123',
      scheduledDate: '2024-01-15T10:00:00Z',
      duration: 0,
      type: 'PRIVATE',
    };

    const result = validate(lessonSchema, invalidLesson);
    expect(result.success).toBe(false);
  });
});

describe('Validation Error Formatting', () => {
  it('should format validation errors correctly', () => {
    const invalidEvent = {
      type: 'INVALID',
      scheduledDate: 'invalid-date',
    };

    const result = validate(eventSchema, invalidEvent);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      expect(typeof errors).toBe('object');
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    }
  });
});
