import * as fs from 'fs'
import * as path from 'path'

import * as stripANSI from 'strip-ansi'

import { DangerDSLType } from '../node_modules/danger/distribution/dsl/DangerDSL'
import {
  IInsideFileTestResults,
  IJestTestOldResults,
  IJestTestResults,
} from './types'
declare var danger: DangerDSLType
declare function fail(message?: string): void

export interface IPluginConfig {
  testResultsJsonPath: string
  relativePath: string
}

export default function jest(config: Partial<IPluginConfig> = {}) {
  const {
    testResultsJsonPath = 'test-results.json',
    relativePath = '',
  } = config
  try {
    const jsonFileContents = fs.readFileSync(testResultsJsonPath, 'utf8')
    const jsonResults: IJestTestResults = JSON.parse(jsonFileContents)
    if (jsonResults.success) {
      // tslint:disable-next-line:no-console
      console.log('Jest tests passed :+1:')
      return
    }

    const isModernFormatResults = jsonResults.testResults[0].testResults
    if (isModernFormatResults) {
      presentErrorsForNewStyleResults(jsonResults, relativePath)
    } else {
      presentErrorsForOldStyleResults(jsonResults as any, relativePath)
    }
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e)
    fail(
      '[danger-plugin-jest] Could not read test results. Danger cannot pass or fail the build.'
    )
  }
}

const presentErrorsForOldStyleResults = (
  jsonResults: IJestTestOldResults,
  relativePath: string
) => {
  const failing = jsonResults.testResults.filter(tr => tr.status === 'failed')

  failing.forEach(results => {
    const relativeFilePath =
      relativePath + path.relative(process.cwd(), results.name)
    const failedAssertions = results.assertionResults.filter(
      r => r.status === 'failed'
    )
    const failMessage = fileToFailString(
      relativeFilePath,
      failedAssertions as any
    )
    fail(failMessage)
  })
}

const presentErrorsForNewStyleResults = (
  jsonResults: IJestTestResults,
  relativePath: string
) => {
  const failing = jsonResults.testResults.filter(tr => tr.numFailingTests > 0)

  failing.forEach(results => {
    const relativeFilePath =
      relativePath + path.relative(process.cwd(), results.testFilePath)
    const failedAssertions = results.testResults.filter(
      r => r.status === 'failed'
    )
    const failMessage = fileToFailString(relativeFilePath, failedAssertions)
    fail(failMessage)
  })
}

const linkToTest = (file: string, msg: string, title: string) => {
  const line = lineOfError(msg, file)

  if (danger.github != null) {
    // e.g. https://github.com/orta/danger-plugin-jest/blob/master/src/__tests__/fails.test.ts
    const githubRoot = danger.github.pr.head.repo.html_url.split(
      danger.github.pr.head.repo.owner.login
    )[0]
    const repo = danger.github.pr.head.repo
    const url = `${githubRoot}${repo.full_name}/blob/${
      danger.github.pr.head.ref
    }/${file}${line ? `#L${line}` : ''}`
    return `<a href='${url}'>${title}</a>`
  }

  if (danger.bitbucket_server != null) {
    // http://bitbucket.ams.gmbh/projects/MDM/repos/madam2/browse/Frontend/app/src/__tests__/failingTest.js?at=refs%2Fheads%2Ffeature%2Fdanger_integration#2
    const bitbucketServerRoot =
      danger.bitbucket_server.pr.fromRef.repository.links['self'][0].href
    const ref = danger.bitbucket_server.pr.fromRef.id
    const url = `${bitbucketServerRoot}/${file.replace(
      /\\/g,
      '/'
    )}?at=${encodeURI(ref)}#${line}`
    return `[${title}](${url})`
  }

  return `${title} (Could not link to the specific test file.)`
}

const assertionFailString = (
  file: string,
  status: IInsideFileTestResults
): string => {
  if (danger.bitbucket_server != null) {
    return `
* ${linkToTest(
      file,
      status.failureMessages && status.failureMessages[0],
      status.title
    )}

    ${sanitizeShortErrorMessage(
      status.failureMessages && stripANSI(status.failureMessages[0])
    )}

    ${status.failureMessages && stripANSI(status.failureMessages.join('\n'))}

`
  } else {
    return `
<li>
${linkToTest(
  file,
  status.failureMessages && status.failureMessages[0],
  status.title
)}
<br/>
${sanitizeShortErrorMessage(
  status.failureMessages && stripANSI(status.failureMessages[0])
)}

<details>
<summary>Full message</summary>
<pre><code>
${status.failureMessages && stripANSI(status.failureMessages.join('\n'))}
</code></pre>
</details>
</li>

`
  }
}

const fileToFailString = (
  // tslint:disable-next-line:no-shadowed-variable
  path: string,
  failedAssertions: IInsideFileTestResults[]
): string => {
  if (danger.github != null) {
    return fileToFailStringGithub(path, failedAssertions)
  }

  if (danger.bitbucket_server != null) {
    return fileToFailStringBitbucketServer(path, failedAssertions)
  }

  return ''
}

const fileToFailStringGithub = (
  // tslint:disable-next-line:no-shadowed-variable
  path: string,
  failedAssertions: IInsideFileTestResults[]
): string => `
<b>Jest FAIL</b> in ${danger.github.utils.fileLinks([path])}


${failedAssertions.map(a => assertionFailString(path, a)).join('\n\n')}
`

const fileToFailStringBitbucketServer = (
  // tslint:disable-next-line:no-shadowed-variable
  path: string,
  failedAssertions: IInsideFileTestResults[]
): string => {
  const bitbucketServerRoot =
    danger.bitbucket_server.pr.fromRef.repository.links['self'][0].href
  const ref = danger.bitbucket_server.pr.fromRef.id
  const url = `${bitbucketServerRoot}/${path.replace(
    /\\/g,
    '/'
  )}?at=${encodeURI(ref)}`
  return `
**Jest FAIL** in [${path}](${url})

${failedAssertions.map(a => assertionFailString(path, a)).join('\n\n')}
`
}

const lineOfError = (msg: string, filePath: string): number | null => {
  const filename = path.basename(filePath)
  const restOfTrace = msg.split(filename, 2)[1]
  return restOfTrace ? parseInt(restOfTrace.split(':')[1], 10) : null
}

const sanitizeShortErrorMessage = (msg: string): string => {
  if (msg.includes('does not match stored snapshot')) {
    return 'Snapshot has changed'
  }

  return msg
    .split('   at', 1)[0]
    .trim()
    .split('\n')
    .splice(2)
    .join('')
    .replace(/\s\s+/g, ' ')
    .replace('Received:', ', received:')
    .replace('., received', ', received')
    .split('Difference:')[0]
}
