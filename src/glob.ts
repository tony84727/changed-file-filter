import {inPlaceReplacer} from './pattern'

type Globber = (path: string) => boolean

export function newGlobber(rules: string[]): Globber {
  const pattern = createGlobberPattern(rules)
  return function (name: string) {
    return pattern.test(name)
  }
}

function createGlobberPattern(rules: string[]): RegExp {
  const replacer = inPlaceReplacer([
    {
      from: '**/',
      to: '.*'
    },
    {
      from: '*',
      to: '[^\\/\\\\]+'
    }
  ])
  return new RegExp(`^${rules.map(replacer).join('|')}$`)
}
