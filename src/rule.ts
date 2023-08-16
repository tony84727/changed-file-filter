import {load} from 'js-yaml'
export interface Rule {
  name: string
  match: string[]
}

export function parseRules(rule: string): Rule[] {
  const rules = load(rule)
  if (typeof rules !== 'object') {
    throw new Error('expect an map')
  }
  return Object.keys(rules).reduce((acc, c) => {
    if (!Array.isArray(rules[c])) {
      throw new Error('expect an array of string')
    }
    // check if each element is a string
    if (!(rules[c] as string[]).every(x => typeof x === 'string')) {
      throw new Error('expect an array of string')
    }
    return [...acc, {name: c, match: rules[c] as string[]}]
  }, [] as Rule[])
}
