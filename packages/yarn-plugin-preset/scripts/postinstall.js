#!/usr/bin/env node
import { execute } from '@yarnpkg/shell'

import packageJson from '../package.json' with { type: 'json' }

const { name, repository, version } = packageJson

const tag = encodeURIComponent(`${name}@${version}`)
const url = new URL(
  `releases/download/${tag}/plugin-preset.js`,
  repository.url.replace(/\.[^/.]+$/, '/')
)

execute(`yarn plugin import ${url.href}`)
