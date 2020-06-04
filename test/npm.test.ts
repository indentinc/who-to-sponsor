import { findSponsorablesInCwd } from '../lib'
import path from 'path'

test('npm: basic', () => {
  let cwd = path.resolve(__dirname, './fixtures/basic-npm/')

  return findSponsorablesInCwd(cwd).then((sponsorables) =>
    expect(sponsorables.length).toBe(6)
  )
})
