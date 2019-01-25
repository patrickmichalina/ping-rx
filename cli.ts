import { writeFileSync, chmodSync } from 'fs'
import { resolve } from 'path'
import { ensureDirSync } from 'fs-extra'

const dir = resolve('dist')
const outPath = resolve(dir, 'pingrx')

ensureDirSync(dir)
writeFileSync(outPath, '#!/usr/bin/env node\nrequire(\'../\').pingcli()')
chmodSync(outPath, '755')