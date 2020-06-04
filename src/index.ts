import * as go from './plugins/go'
import * as npm from './plugins/npm'
import { Sponsorable } from './utils'

export async function findSponsorablesInCwd(
  cwd: string
): Promise<Sponsorable[]> {
  let recipients: Sponsorable[] = []
  let foundGoModPath = await go.matchCwd(cwd)
  let foundPackageJsonPath = await npm.matchCwd(cwd)

  if (foundPackageJsonPath) {
    try {
      let npmSponsorables = await npm.getSponsorables(foundPackageJsonPath)

      recipients = [...recipients, ...npmSponsorables]
    } catch (err) {
      console.error(err)
    }
  }

  if (foundGoModPath) {
    try {
      let goSponsorables = await go.getSponsorables(foundGoModPath)

      recipients = [...recipients, ...goSponsorables]
    } catch (err) {
      console.error(err)
    }
  }

  return recipients
}
