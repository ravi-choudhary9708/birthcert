import { customAlphabet } from 'nanoid';

// Unambiguous uppercase alphanumeric — removes O/0 and I/1/L confusion
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const generate = customAlphabet(alphabet, 8);

export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  return `BC-${year}-${generate()}`;
}
