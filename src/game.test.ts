import { describe, expect, it } from 'vitest'
import { cellsFor, crossingLetters, makeBank, makeBoard, newProgress, normalize, readSave, starsFor } from './game'
import { levels } from './levels'

describe('crossword data', () => {
  it('has four entries, at least one picture and three valid crossings in every level', () => {
    for (const level of levels) {
      const cells = [...makeBoard(level).values()]
      expect(level.entries).toHaveLength(4)
      expect(level.entries.some((entry) => entry.clue.kind === 'picture')).toBe(true)
      expect(cells.filter((cell) => cell.entries.length === 2)).toHaveLength(3)
    }
  })

  it('fills crossing letters from right-to-left answers and rejects conflicts', () => {
    const level = levels[0]
    const [book, key] = level.entries
    expect(cellsFor(book).map(({ x }) => x)).toEqual([6, 5, 4, 3])
    expect(crossingLetters(level, key, { ...newProgress(), solved: [book.id] })).toEqual([null, null, 'ت', null, null])
    expect(() => makeBoard({ ...level, entries: [book, { ...key, answer: 'مفراح' }] })).toThrow(/Conflicting crossing/)
  })

  it('keeps distinct tile IDs for repeated answer letters', () => {
    const bank = makeBank({ ...levels[0].entries[0], answer: 'باب' })
    const tiles = bank.filter((tile) => tile.letter === 'ب')
    expect(tiles).toHaveLength(2)
    expect(tiles[0].id).not.toBe(tiles[1].id)
  })

  it('removes vowel marks, spacing and tatweel while preserving letters', () => {
    expect(normalize('  كِتَـابٌ ')).toBe('كتاب')
    expect(normalize('أ')).not.toBe(normalize('ا'))
  })

  it('round-trips progress and ignores malformed progress', () => {
    const save = { study: { ...newProgress(), solved: ['book'], credits: 8, hints: 1 } }
    expect(readSave({ getItem: () => JSON.stringify(save) }, levels)).toEqual(save)
    expect(readSave({ getItem: () => '[' }, levels)).toEqual({})
  })

  it('awards three, two, or one star based on hint count', () => {
    expect([0, 1, 2, 5].map(starsFor)).toEqual([3, 2, 1, 1])
  })
})
