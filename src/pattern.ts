export interface Replace {
  from: string
  to: string
}

type Replacer = (input: string) => string

export function inPlaceReplacer(replaces: Replace[]): Replacer {
  const pattern = new RegExp(
    replaces.map(x => `(${escapeRegex(x.from)})`).join('|'),
    'g'
  )
  const replacement: {[from: string]: string} = replaces.reduce(
    (acc, {from, to}) => ({...acc, [from]: to}),
    {}
  )
  return function (x: string) {
    let matches = undefined
    const toReplace: {
      start: number
      match: string
    }[] = []
    do {
      matches = pattern.exec(x)
      if (matches) {
        toReplace.push({start: matches.index, match: matches[0]})
      }
    } while (matches)
    return toReplace.reduce(
      (acc, {start, match}) => {
        if (replacement[match]) {
          const {drift, current} = acc
          return {
            drift: drift + replacement[match].length - match.length,
            current:
              current.slice(0, start + drift) +
              replacement[match] +
              current.slice(start + drift + match.length)
          }
        }
        return acc
      },
      {drift: 0, current: x}
    ).current
  }
}

function escapeRegex(literal: string): string {
  return literal.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}
