import { parseDiceExpression } from '@dicecrew/shared'

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}

export function rollDice(expression) {
  const parsed = parseDiceExpression(expression)
  if (!parsed) return null

  const { count, sides, keep, modifier } = parsed

  let rolls = Array.from({ length: count }, () => rollDie(sides))
  let kept  = [...rolls]

  if (keep) {
    const sorted = [...rolls].sort((a, b) => b - a)
    kept = keep.type === 'highest'
      ? sorted.slice(0, keep.count)
      : sorted.slice(-keep.count)
  }

  const subtotal = kept.reduce((sum, n) => sum + n, 0)
  const total    = subtotal + modifier

  return {
    expression,
    rolls,
    kept,
    modifier,
    total,
  }
}
