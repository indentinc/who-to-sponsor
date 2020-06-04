import * as fs from 'fs'
import { promisify } from 'util'
import { Sponsorable, getIfSponsorable } from '../utils'

const exists = promisify(fs.exists).bind(fs)
const readFile = promisify(fs.readFile).bind(fs)

export async function matchCwd(cwd: string): Promise<string> {
  let modExists = await exists(cwd + '/go.mod')

  if (!modExists) {
    return ''
  }

  return cwd
}

export async function getSponsorables(cwd: string): Promise<Sponsorable[]> {
  let mod = await readFile(cwd + '/go.mod')
  let lines = mod.toString().split('\n')
  let repos = lines
    .filter((line) => /(.*) v([0-9]|\.)*/.test(line))
    .map((line) => line.trim().split(' ')[0])
    .filter((s) => /github\.com/.test(s))
    .map((repoHostAndPath) => repoHostAndPath.split('/').slice(1, 3).join('/'))

  let sponsorables = (await Promise.all(repos.map(getIfSponsorable))).filter(
    (s) => s.name
  )

  return sponsorables
}
