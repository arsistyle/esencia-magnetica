import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('joins two class names with a space', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out null, undefined, and false', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cn(null, undefined, false)).toBe('')
  })
})
