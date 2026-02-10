import { toCsv } from '../csv';

describe('toCsv', () => {
  it('generates correct CSV output from array of objects', () => {
    const data = [
      { name: 'Thunder', breed: 'Thoroughbred', age: 7 },
      { name: 'Bella', breed: 'Arabian', age: 12 },
    ];

    const result = toCsv(data, [
      { key: 'name', header: 'Horse Name' },
      { key: 'breed', header: 'Breed' },
      { key: 'age', header: 'Age' },
    ]);

    expect(result).toBe('Horse Name,Breed,Age\nThunder,Thoroughbred,7\nBella,Arabian,12');
  });

  it('handles special characters (commas) in values', () => {
    const data = [{ name: 'Smith, John', value: 'hello' }];

    const result = toCsv(data, [
      { key: 'name', header: 'Name' },
      { key: 'value', header: 'Value' },
    ]);

    expect(result).toBe('Name,Value\n"Smith, John",hello');
  });

  it('handles special characters (quotes) in values', () => {
    const data = [{ name: 'He said "hello"', value: 'ok' }];

    const result = toCsv(data, [
      { key: 'name', header: 'Name' },
      { key: 'value', header: 'Value' },
    ]);

    expect(result).toBe('Name,Value\n"He said ""hello""",ok');
  });

  it('handles special characters (newlines) in values', () => {
    const data = [{ name: 'Line1\nLine2', value: 'test' }];

    const result = toCsv(data, [
      { key: 'name', header: 'Name' },
      { key: 'value', header: 'Value' },
    ]);

    expect(result).toBe('Name,Value\n"Line1\nLine2",test');
  });

  it('handles empty arrays', () => {
    const result = toCsv([], [
      { key: 'name' as any, header: 'Name' },
    ]);

    expect(result).toBe('Name');
  });

  it('handles null and undefined values', () => {
    const data = [{ name: null, value: undefined }];

    const result = toCsv(data as any, [
      { key: 'name', header: 'Name' },
      { key: 'value', header: 'Value' },
    ]);

    expect(result).toBe('Name,Value\n,');
  });

  it('handles custom column definitions (subset of fields)', () => {
    const data = [
      { name: 'Thunder', breed: 'Thoroughbred', age: 7, color: 'Bay' },
    ];

    const result = toCsv(data, [
      { key: 'name', header: 'Name' },
      { key: 'color', header: 'Color' },
    ]);

    expect(result).toBe('Name,Color\nThunder,Bay');
  });
});
