# danger-plugin-jest

> [Danger](https://github.com/danger/danger-js) plugin for Jest

## Usage

### Setup Jest

This Danger plugin relies on modifying your Jest configuration slightly on CI to also output a JSON file of the results.

You need to make the `yarn jest` command include: `--outputFile test-results.json --json`. This will run your tests
like normal, but will also create a file with the full test results after.

> You may also want to add the JSON output file to your `.gitignore`, since it doesn't need to be checked into source control.

### Setup Danger

Install this Danger plugin:

```sh
yarn add danger-plugin-jest --dev
```

By default, this package will assume you've set the filename as `test-results.json`, but you can use any path.

```js
// dangerfile.js
import path from 'path'
import jest from 'danger-plugin-jest'

// Default
jest()
// Custom path
jest({ testResultsJsonPath: path.resolve(__dirname, 'tests/results.json') })
```

See [`src/index.ts`](https://github.com/macklinu/danger-plugin-jest/blob/master/src/index.ts) for more details.

## Changelog

See the GitHub [release history](https://github.com/macklinu/danger-plugin-jest/releases).

## Development

Install [Yarn](https://yarnpkg.com/en/), and install the dependencies - `yarn install`.

Run the [Jest](https://facebook.github.io/jest/) test suite with `yarn test`.

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated NPM package publishing.

:heart:

## Notice

This is a fork of https://github.com/macklinu/danger-plugin-jest