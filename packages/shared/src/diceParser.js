// Parses expressions like: 1d20, 2d6+3, 4d6kh3, d20, 1d20-1
const DICE_REGEX = /^(\d*)d(\d+)(kh\d+|kl\d+)?(([+-])(\d+))?$/i

export function parseDiceExpression(expr) {
  const clean = expr.trim().toLowerCase().replace(/^\/roll\s*/, '')
  const match = clean.match(DICE_REGEX)

  if (!match) return null

  const count    = parseInt(match[1] || '1', 10)
  const sides    = parseInt(match[2], 10)
  const keepExpr = match[3] || null
  const sign     = match[5] || null
  const modifier = match[6] ? parseInt(match[6], 10) : 0

  if (count < 1 || count > 100)  return null
  if (sides < 2 || sides > 1000) return null

  let keep = null
  if (keepExpr) {
    const keepType  = keepExpr.startsWith('kh') ? 'highest' : 'lowest'
    const keepCount = parseInt(keepExpr.slice(2), 10)
    if (keepCount < 1 || keepCount > count) return null
    keep = { type: keepType, count: keepCount }
  }

  return {
    raw:      clean,
    count,
    sides,
    keep,
    modifier: sign === '-' ? -modifier : modifier,
  }
}

export function isRollCommand(text) {
  return text.trim().toLowerCase().startsWith('/roll ')
}

export function extractExpression(text) {
  return text.trim().replace(/^\/roll\s*/i, '')
}
