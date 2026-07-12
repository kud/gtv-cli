// A tiny fuzzy matcher for the app launcher's filter. The catalog is small
// (tens of entries), so a case-insensitive subsequence match with a light score
// beats pulling in a dependency: consecutive runs and a start-of-string hit
// rank higher, so "nf" → Netflix and "yt" → YouTube surface at the top.
const score = (query: string, text: string): number | null => {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let qi = 0
  let total = 0
  let prev = -2
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] !== q[qi]) continue
    total += ti === prev + 1 ? 3 : 1 // reward consecutive matches
    if (ti === 0) total += 2 // reward matching the very start
    prev = ti
    qi++
  }
  return qi === q.length ? total : null
}

// Returns the items whose key fuzzily matches, best score first. Ties keep the
// catalog's original order (Array.sort is stable), so an empty query is a no-op
// passthrough.
const fuzzyFilter = <T>(
  query: string,
  items: readonly T[],
  key: (item: T) => string,
): T[] => {
  if (!query) return [...items]
  return items
    .map((item) => ({ item, s: score(query, key(item)) }))
    .filter((r): r is { item: T; s: number } => r.s !== null)
    .sort((a, b) => b.s - a.s)
    .map((r) => r.item)
}

export { fuzzyFilter }
