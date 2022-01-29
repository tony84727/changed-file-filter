import {inPlaceReplacer} from '../src/pattern'

/**
 * @group unit
 */
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
