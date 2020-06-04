#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import path, { resolve } from 'path'
import chalk from 'chalk'
import prompts from 'prompts'
import Commander from 'commander'
import checkForUpdate from 'update-check'
import { shouldUseYarn } from './helpers/should-use-yarn'
import { findSponsorablesInCwd } from '.'
import { renderChalkTable } from './helpers/chalk-table'

let projectPath: string = ''
let version = '0.0.0'

const program = new Commander.Command('who-to-sponsor')
  .version(version)
  .description(
    'Easily find users and organizations to sponsor on GitHub by finding projects you depend upon.'
  )
  .arguments('[project-directory]')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => (projectPath = name))
  .allowUnknownOption()
  .parse(process.argv)

async function run(): Promise<void> {
  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim()
  }

  if (!projectPath) {
    projectPath = process.cwd()
  }

  if (!projectPath) {
    console.log()
    console.log('Please specify the project directory:')
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    )
    console.log()
    console.log('For example:')
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-next-app')}`)
    console.log()
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    )
    process.exit(1)
  }

  const resolvedProjectPath = path.resolve(process.cwd(), projectPath)

  try {
    let sponsorables = await findSponsorablesInCwd(resolvedProjectPath)

    console.log(
      renderChalkTable(
        {
          leftPad: 2,
          columns: [
            { field: 'name', name: chalk.magenta('Package Name') },
            { field: 'funding.url', name: chalk.green('Funding URL') },
          ],
        },
        sponsorables
      )
    )
  } catch (reason) {
    console.log(chalk.red('Unexpected error. Please report it as a bug:'))
    console.error(reason)
  }
}

const update = checkForUpdate({ name: 'who-to-sponsor', version }).catch(
  () => null
)

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update
    if (res?.latest) {
      const isYarn = shouldUseYarn()

      console.log()
      console.log(
        chalk.yellow.bold('A new version of `who-to-sponsor` is available!')
      )
      console.log(
        'You can update by running: ' +
          chalk.cyan(
            isYarn
              ? 'yarn global add who-to-sponsor'
              : 'npm i -g who-to-sponsor'
          )
      )
      console.log()
    }
    process.exit()
  } catch {
    // ignore error
  }
}

run()
  // .then(notifyUpdate)
  .catch(async (reason) => {
    console.log()
    console.log('Sorry, `who-to-sponsor` ran into an issue.')
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`)
    } else {
      console.log(chalk.red('Unexpected error. Please report it as a bug:'))
      console.log(reason)
    }
    console.log()

    // await notifyUpdate()

    process.exit(1)
  })
