import { equal } from 'uvu/assert'
import { test } from 'uvu'

import { persistentAtom, persistentMap } from '../index.js'

test('works without localStorage', () => {
  let map = persistentMap<{ one?: string; two?: string }>('a:', {
    one: '1'
  })
  map.listen(() => {})
  map.setKey('two', '2')
  equal(map.get(), { one: '1', two: '2' })
})

test('works without localStorage', () => {
  let store = persistentAtom<string>('a', '1')
  store.listen(() => {})
  store.set('2')
  equal(store.get(), '2')
})

test.run()
