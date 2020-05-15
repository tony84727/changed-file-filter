import {inPlaceReplacer} from '../src/pattern'

describe('inPlaceReplacer', () => {
  it('replaces strings without conflict', () => {
    const replacer = inPlaceReplacer([
      {
        from: '**',
        to: '*'
      },
      {
        from: '*',
        to: 'a'
      }
    ])
    expect(replacer('**/*/*')).toEqual('*/a/a')
  })
})
