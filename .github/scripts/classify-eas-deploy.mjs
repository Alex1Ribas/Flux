#!/usr/bin/env node
/**
 * Classifica mudanças do Frontend para deploy EAS:
 * HOT | BUILD | MISTO | SKIP
 *
 * Uso:
 *   node classify-eas-deploy.mjs <before_sha> <after_sha>
 *
 * Exit sempre 0 (não bloqueia push).
 */

import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'

const beforeSha = process.argv[2] || ''
const afterSha = process.argv[3] || 'HEAD'
const zeroSha = /^0+$/

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function listChangedFiles(before, after) {
  if (!before || zeroSha.test(before)) {
    return git(['diff-tree', '--no-commit-id', '--name-only', '-r', after])
      .split('\n')
      .filter(Boolean)
  }

  try {
    return git(['diff', '--name-only', `${before}...${after}`])
      .split('\n')
      .filter(Boolean)
  } catch {
    return git(['diff-tree', '--no-commit-id', '--name-only', '-r', after])
      .split('\n')
      .filter(Boolean)
  }
}

function readJsonAt(sha, filePath) {
  try {
    const raw = git(['show', `${sha}:${filePath}`])
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readJsonLocal(filePath) {
  if (!existsSync(filePath)) return null
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

/** Campos de app.json que pedem BUILD (nativo / runtime). */
function appJsonNeedsBuild(beforeExpo, afterExpo) {
  if (!afterExpo) return false
  if (!beforeExpo) return true

  const nativeKeys = [
    'version',
    'icon',
    'scheme',
    'plugins',
    'ios',
    'android',
    'runtimeVersion',
    'updates',
    'orientation',
    'userInterfaceStyle',
    'splash',
  ]

  for (const key of nativeKeys) {
    if (JSON.stringify(beforeExpo[key]) !== JSON.stringify(afterExpo[key])) {
      return true
    }
  }

  const beforeEas = beforeExpo.extra?.eas
  const afterEas = afterExpo.extra?.eas
  if (JSON.stringify(beforeEas) !== JSON.stringify(afterEas)) {
    return true
  }

  return false
}

function isHotPath(filePath) {
  if (!filePath.startsWith('Frontend/')) return false

  const relative = filePath.slice('Frontend/'.length)

  if (relative.startsWith('src/')) return true
  if (relative.startsWith('assets/')) return true
  if (
    [
      'global.css',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
      'nativewind-env.d.ts',
      'tsconfig.json',
      'index.js',
      'App.tsx',
      'app.config.js',
      'app.config.ts',
    ].includes(relative)
  ) {
    return true
  }

  if (relative === 'app.json') return true

  return false
}

function isHardBuildPath(filePath) {
  if (filePath === 'Frontend/yarn.lock') return true
  if (filePath === 'Frontend/eas.json') return true
  if (filePath.startsWith('Frontend/android/')) return true
  if (filePath.startsWith('Frontend/ios/')) return true
  if (filePath.startsWith('Frontend/plugins/')) return true
  return false
}

/** package.json: BUILD só se deps/SDK mudarem; scripts/meta sozinhos não pedem APK. */
function packageJsonNeedsBuild(beforePkg, afterPkg) {
  if (!afterPkg) return false
  if (!beforePkg) return true

  const keys = ['dependencies', 'devDependencies', 'resolutions', 'overrides']
  for (const key of keys) {
    if (JSON.stringify(beforePkg[key]) !== JSON.stringify(afterPkg[key])) {
      return true
    }
  }
  return false
}

function escapeOutput(value) {
  return value.replace(/\n/g, '%0A')
}

function printResult(verdict, summary, reasonList) {
  const reasonsText = reasonList.length > 0 ? reasonList.join('\n') : '(nenhum)'
  console.log(`Veredito: ${verdict}`)
  console.log(`Motivo: ${summary}`)
  console.log('Detalhes:')
  console.log(reasonsText)

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `verdict=${verdict}\nsummary=${escapeOutput(summary)}\n`
    )
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `reasons<<EOF\n${reasonsText}\nEOF\n`
    )
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      [
        `## EAS deploy — ${verdict}`,
        '',
        summary,
        '',
        '### Detalhes',
        '',
        '```',
        reasonsText,
        '```',
        '',
      ].join('\n')
    )
  }
}

const changed = listChangedFiles(beforeSha, afterSha)
const frontendFiles = changed.filter((filePath) => filePath.startsWith('Frontend/'))

const reasons = []
let hasHot = false
let hasBuild = false

if (frontendFiles.length === 0) {
  printResult(
    'SKIP',
    'Nenhuma mudança em Frontend/ — hot update não se aplica.',
    reasons
  )
  process.exit(0)
}

for (const filePath of frontendFiles) {
  if (filePath === 'Frontend/package.json') {
    const beforePkg =
      beforeSha && !zeroSha.test(beforeSha)
        ? readJsonAt(beforeSha, 'Frontend/package.json')
        : null
    const afterPkg =
      readJsonAt(afterSha, 'Frontend/package.json') ||
      readJsonLocal('Frontend/package.json')

    if (packageJsonNeedsBuild(beforePkg, afterPkg)) {
      hasBuild = true
      reasons.push(
        'BUILD: Frontend/package.json alterou dependencies/devDependencies'
      )
    } else {
      reasons.push(
        'IGNORADO: Frontend/package.json sem mudança de dependências'
      )
    }
    continue
  }

  if (isHardBuildPath(filePath)) {
    hasBuild = true
    reasons.push(`BUILD: ${filePath}`)
    continue
  }

  if (filePath === 'Frontend/app.json') {
    const beforeApp =
      beforeSha && !zeroSha.test(beforeSha)
        ? readJsonAt(beforeSha, 'Frontend/app.json')
        : null
    const afterApp =
      readJsonAt(afterSha, 'Frontend/app.json') ||
      readJsonLocal('Frontend/app.json')
    const beforeExpo = beforeApp?.expo ?? null
    const afterExpo = afterApp?.expo ?? null

    if (appJsonNeedsBuild(beforeExpo, afterExpo)) {
      hasBuild = true
      reasons.push(
        'BUILD: Frontend/app.json alterou campos nativos/runtime (version, plugins, ios, android, icon, etc.)'
      )
    } else {
      hasHot = true
      reasons.push(
        'HOT: Frontend/app.json só com mudanças JS-safe (ex.: extra.fluxApiBaseUrl)'
      )
    }
    continue
  }

  if (isHotPath(filePath)) {
    hasHot = true
    reasons.push(`HOT: ${filePath}`)
    continue
  }

  reasons.push(`IGNORADO: ${filePath} (não afeta bundle OTA nem binary)`)
}

let verdict = 'SKIP'
if (hasHot && hasBuild) verdict = 'MISTO'
else if (hasBuild) verdict = 'BUILD'
else if (hasHot) verdict = 'HOT'

let summary = ''
if (verdict === 'HOT') {
  summary =
    'Mudanças se encaixam em hot update (OTA). Publicando via EAS Update no channel production.'
} else if (verdict === 'BUILD') {
  summary =
    'Hot update NÃO se aplica — é necessário novo APK (eas build). O push não é bloqueado; rode o build manualmente quando for o caso.'
} else if (verdict === 'MISTO') {
  summary =
    'Há mudanças HOT e gatilhos de BUILD. Hot update sozinho não entrega a parte nativa — prefira eas build. O push não é bloqueado.'
} else {
  summary =
    'Mudanças em Frontend/ não pedem hot update nem build nativo (ex.: docs/CI). Nada a publicar.'
}

printResult(verdict, summary, reasons)
process.exit(0)
