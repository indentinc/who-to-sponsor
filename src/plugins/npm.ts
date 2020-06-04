import * as fs from 'fs'
import { promisify } from 'util'
import { flattenDeep } from 'lodash'
import { Sponsorable } from '../utils'
import { execSync } from 'child_process'

const exists = promisify(fs.exists).bind(fs)

export async function matchCwd(cwd: string): Promise<string> {
  let pkgExists = await exists(cwd + '/package.json')

  if (!pkgExists) {
    return ''
  }

  // TODO: add nested directory checking for apps with `ui/` or `src/` pattern

  return cwd
}

export async function getSponsorables(
  pkgLocation: string
): Promise<Sponsorable[]> {
  try {
    let json = execSync('npm fund --json', {
      cwd: pkgLocation,
    })
      .toString()
      .trim()
    let pkgFunding = JSON.parse(json)
    let { dependencies } = pkgFunding

    return flattenDependenciesIntoSponsorables(dependencies)
  } catch (err) {
    throw err
  }
}

export function flattenDependenciesIntoSponsorables(deps: any): Sponsorable[] {
  let toSponsorables = (o: any) =>
    Object.keys(o).map((name: string) => [
      [{ name, funding: o[name].funding }] as Sponsorable[],
      o[name].dependencies
        ? flattenDependenciesIntoSponsorables(o[name].dependencies)
        : [],
    ])

  return flattenDeep(toSponsorables(deps))
}
