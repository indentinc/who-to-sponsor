import { findSponsorablesInCwd } from '../lib'
import path from 'path'

test('go: basic', () => {
  let cwd = path.resolve(__dirname, './fixtures/basic-go/')

  return findSponsorablesInCwd(cwd).then((sponsorables) => {
    expect(sponsorables).toStrictEqual([
      {
        name: 'caddyserver',
        repo: 'caddyserver/caddy',
        funding: {
          type: 'github',
          url: 'https://github.com/sponsors/mholt',
        },
      },
    ])
  })
}, 10000)
