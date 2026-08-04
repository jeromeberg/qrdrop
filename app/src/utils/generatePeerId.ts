import { customAlphabet } from 'nanoid'

const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const nanoid = customAlphabet(alphabet, 6)

export function generatePeerId(): string {
  return nanoid()
}
