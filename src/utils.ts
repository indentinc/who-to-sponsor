import axios, { AxiosError } from 'axios'
import yaml from 'yaml'

export interface SponsorFunding {
  type: string
  url: string
}

export interface Sponsorable {
  name: string
  repo?: string
  funding?: SponsorFunding
}

export async function getIfSponsorable(repo: string): Promise<Sponsorable> {
  let [owner, repoName] = repo.split('/')

  if (!(owner && repoName)) {
    throw new Error('invalid repo name: ' + repo)
  }

  try {
    // check if there's a `.github/funding.yml` in the repo
    let fundingFile = await getFile(repo, '.github/funding.yml')

    if (!fundingFile) {
      fundingFile = await getFile(repo, '.github/FUNDING.yml')
    }

    if (!fundingFile) {
      // check if there's a `.github` repo for the owner that has a `funding.yml`
      fundingFile = await getFile([owner, '.github'].join('/'), 'funding.yml')

      if (!fundingFile) {
        fundingFile = await getFile([owner, '.github'].join('/'), 'FUNDING.yml')
      }
    }

    if (!fundingFile) {
      return { name: '' }
    }

    let fundingConfig: any = yaml.parse(fundingFile)

    // for now, just supports github
    let sponsorable: Sponsorable = {
      name: owner,
      repo,
      funding: {
        type: 'github',
        url: fundingConfig.github
          ? `https://github.com/sponsors/${fundingConfig.github[0]}`
          : '',
      },
    }

    if (!sponsorable.funding?.url) {
      sponsorable.name = ''
    }

    return sponsorable
  } catch (err) {
    throw err
  }
}

async function getFile(repo: string, file: string): Promise<any> {
  try {
    return await axios
      .get(`https://cdn.jsdelivr.net/gh/${repo}@master/${file}`)
      .then((r) => r.data)
  } catch (err) {
    if (err.message === 'Request failed with status code 404') {
      return ''
    }

    return ''
  }
}
