import type { Entry, Level } from './levels'

type Attempt = {
  tiles: Array<string | null>
  revealed: number[]
  removed: string[]
}

export type Progress = {
  solved: string[]
  attempts: Record<string, Attempt>
  hints: number
  credits: number
}

export type Save = Record<string, Progress>

type Cell = { letter: string; x: number; y: number; entries: Entry[] }

export const storageKey = 'huruf-wa-kalimat-v1'

export function normalize(answer: string) {
  return answer.normalize('NFC').replace(/[\s\u064B-\u0652\u0670\u0640]/gu, '')
}

export function cellsFor(entry: Entry) {
  return Array.from(entry.answer, (letter, index) => ({
    letter,
    x: entry.x - (entry.direction === 'across' ? index : 0),
    y: entry.y + (entry.direction === 'down' ? index : 0),
  }))
}

const cellKey = (x: number, y: number) => `${x},${y}`

export function makeBoard(level: Level) {
  const board = new Map<string, Cell>()
  const ids = new Set<string>()
  for (const entry of level.entries) {
    if (ids.has(entry.id) || !/^[\u0621-\u063A\u0641-\u064A]{2,10}$/u.test(entry.answer)) {
      throw new Error(`Invalid entry: ${entry.id}`)
    }
    ids.add(entry.id)
    for (const cell of cellsFor(entry)) {
      if (cell.x < 0 || cell.y < 0 || !Number.isInteger(cell.x) || !Number.isInteger(cell.y)) {
        throw new Error(`Invalid cell: ${entry.id}`)
      }
      const key = cellKey(cell.x, cell.y)
      const previous = board.get(key)
      if (previous) {
        if (previous.letter !== cell.letter || previous.entries.some(({ direction }) => direction === entry.direction)) {
          throw new Error(`Conflicting crossing at ${key}`)
        }
        previous.entries.push(entry)
      } else {
        board.set(key, { ...cell, entries: [entry] })
      }
    }
  }
  return board
}

export function crossingLetters(level: Level, entry: Entry, progress: Progress) {
  const board = makeBoard(level)
  return cellsFor(entry).map(({ x, y, letter }) =>
    board.get(cellKey(x, y))?.entries.some(({ id }) => progress.solved.includes(id))
      ? letter
      : null,
  )
}

export function newProgress(): Progress {
  return { solved: [], attempts: {}, hints: 0, credits: 10 }
}

export function getAttempt(entry: Entry, progress: Progress): Attempt {
  return progress.attempts[entry.id] ?? {
    tiles: Array(entry.answer.length).fill(null),
    revealed: [],
    removed: [],
  }
}

export function makeBank(entry: Entry) {
  const distractors = Array.from('ضنسفةذوجقأكطزخيمتصعهلبدغشثاحبر')
    .filter((letter) => !entry.answer.includes(letter)).slice(0, 12 - entry.answer.length)
  const bank = [
    ...Array.from(entry.answer, (letter, index) => ({ id: `a${index}`, letter, distractor: false })),
    ...distractors.map((letter, index) => ({ id: `d${index}`, letter, distractor: true })),
  ]
  let seed = Array.from(entry.id).reduce((value, char) => (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0, 0)
  for (let index = bank.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const target = seed % (index + 1)
    const tile = bank[index]
    bank[index] = bank[target]
    bank[target] = tile
  }
  return bank
}

export function starsFor(hints: number) {
  return Math.max(1, 3 - hints)
}

export function readSave(storage: Pick<Storage, 'getItem'>, levels: Level[]): Save {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(storageKey) ?? 'null')
    if (!isRecord(parsed)) return {}
    const valid: Save = {}
    for (const level of levels) {
      const raw = parsed[level.id]
      if (!isRecord(raw)) continue
      const progress = newProgress()
      progress.solved = level.entries.filter(({ id }) => Array.isArray(raw.solved) && raw.solved.includes(id)).map(({ id }) => id)
      progress.hints = isCounter(raw.hints) ? raw.hints : 0
      progress.credits = isCounter(raw.credits) ? raw.credits : 10
      const attempts = raw.attempts
      if (isRecord(attempts)) {
        for (const entry of level.entries) {
          const attempt = attempts[entry.id]
          if (!isRecord(attempt)) continue
          const bank = makeBank(entry)
          const removed = bank.filter((tile) => tile.distractor && Array.isArray(attempt.removed) && attempt.removed.includes(tile.id)).map(({ id }) => id)
          const revealed = Array.from(entry.answer, (_, index) => index).filter((index) => Array.isArray(attempt.revealed) && attempt.revealed.includes(index))
          const locked = crossingLetters(level, entry, progress)
          const used = new Set<string>()
          const tiles = Array.from(entry.answer, (_, index) => {
            const id: unknown = Array.isArray(attempt.tiles) ? attempt.tiles[index] : null
            if (typeof id !== 'string' || locked[index] || revealed.includes(index) || used.has(id) || removed.includes(id) || !bank.some((tile) => tile.id === id)) return null
            used.add(id)
            return id
          })
          progress.attempts[entry.id] = { tiles, revealed, removed }
        }
      }
      valid[level.id] = progress
    }
    return valid
  } catch {
    return {}
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isCounter(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10
}
