import * as path from 'path'
import * as fs from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

interface JavaBridgeResult {
  success: boolean
  error?: string
  data?: ParseResult
  path?: string
}

/**
 * Main DAT file parser
 * Supports V1 and V3 format
 * XOR rotation key = tickNo % 256
 */

interface Record {
  type: number
  tickNo: number
  payloadLength: number
  start: number
  payload?: Buffer
}

interface ParseResult {
  acType: string
  clockRate: number
  records: Record[]
  gpsLocked: boolean
  firstMotorTick: number
  lastMotorTick: number
  lowestTick: number
  highestTick: number
  analysisMessage?: string
}

function getJavaPaths() {
  const electronRoot = path.resolve(__dirname, '..', '..')
  const repoRoot = path.resolve(electronRoot, '..')
  const javaRoot = path.join(repoRoot, 'DatCon')
  const javaSrcRoot = path.join(javaRoot, 'src')
  const classesDir = path.join(javaRoot, 'bin-bridge')
  const bridgeJava = path.join(javaRoot, 'src', 'apps', 'DatConCliBridge.java')
  const bridgeClass = path.join(classesDir, 'src', 'apps', 'DatConCliBridge.class')
  const iaMathJar = path.join(javaRoot, 'lib', 'ia_math.jar')

  return { javaRoot, javaSrcRoot, classesDir, bridgeJava, bridgeClass, iaMathJar }
}

function getLatestJavaSourceMtimeMs(dir: string): number {
  if (!fs.existsSync(dir)) {
    return 0
  }

  let latest = 0
  const stack: string[] = [dir]

  while (stack.length > 0) {
    const current = stack.pop()!
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      if (!entry.name.endsWith('.java')) {
        continue
      }
      const mtime = fs.statSync(fullPath).mtimeMs
      if (mtime > latest) {
        latest = mtime
      }
    }
  }

  return latest
}

function getJavaBinName(tool: 'java' | 'javac'): string {
  return process.platform === 'win32' ? `${tool}.exe` : tool
}

function getJavaHomeCandidates(): string[] {
  const candidates: string[] = []

  if (process.env.JAVA_HOME) {
    candidates.push(process.env.JAVA_HOME)
  }

  if (process.platform === 'win32') {
    const roots = [
      'C:\\Program Files\\Eclipse Adoptium',
      'C:\\Program Files\\Java',
      'C:\\Program Files\\Microsoft'
    ]

    for (const root of roots) {
      if (!fs.existsSync(root)) {
        continue
      }

      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
          continue
        }

        const name = entry.name.toLowerCase()
        if (name.startsWith('jdk') || name.includes('jdk')) {
          candidates.push(path.join(root, entry.name))
        }
      }
    }
  }

  const normalized = new Set<string>()
  const unique: string[] = []
  for (const c of candidates) {
    const norm = path.normalize(c)
    if (!normalized.has(norm)) {
      normalized.add(norm)
      unique.push(norm)
    }
  }

  return unique
}

function resolveJavaTool(tool: 'java' | 'javac'): string {
  const toolName = getJavaBinName(tool)

  const explicitPathEnv = process.env[`DATCON_${tool.toUpperCase()}_PATH`]
  if (explicitPathEnv && fs.existsSync(explicitPathEnv)) {
    return explicitPathEnv
  }

  for (const javaHome of getJavaHomeCandidates()) {
    const fromHome = path.join(javaHome, 'bin', toolName)
    if (fs.existsSync(fromHome)) {
      return fromHome
    }
  }

  // Fallback to PATH if available.
  return tool
}

async function ensureJavaBridgeCompiled() {
  const { javaRoot, javaSrcRoot, classesDir, bridgeJava, bridgeClass, iaMathJar } = getJavaPaths()
  const javacExec = resolveJavaTool('javac')

  if (!fs.existsSync(bridgeJava)) {
    throw new Error(`Java bridge source not found: ${bridgeJava}`)
  }

  const latestSourceMtimeMs = getLatestJavaSourceMtimeMs(javaSrcRoot)
  const compiledMtimeMs = fs.existsSync(bridgeClass) ? fs.statSync(bridgeClass).mtimeMs : 0
  const shouldCompile = !fs.existsSync(bridgeClass) || latestSourceMtimeMs > compiledMtimeMs

  if (!shouldCompile) {
    return
  }

  // Remove stale classes so dependent sources are recompiled when core files change.
  if (fs.existsSync(classesDir)) {
    fs.rmSync(classesDir, { recursive: true, force: true })
  }
  fs.mkdirSync(classesDir, { recursive: true })

  try {
    await execFileAsync(
      javacExec,
      [
        '-cp',
        iaMathJar,
        '-d',
        classesDir,
        '-sourcepath',
        javaRoot,
        bridgeJava
      ],
      { cwd: javaRoot, windowsHide: true }
    )
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        'Khong tim thay javac. Vui long cai JDK (khong chi JRE), hoac dat JAVA_HOME dung toi thu muc JDK.'
      )
    }

    const details = [error?.stdout, error?.stderr].filter(Boolean).join('\n')
    throw new Error(`Khong the build Java bridge: ${details || error?.message || 'unknown error'}`)
  }
}

function parseJsonLine(output: string): JavaBridgeResult {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (line.startsWith('{') && line.endsWith('}')) {
      return JSON.parse(line) as JavaBridgeResult
    }
  }

  throw new Error(output || 'Java bridge returned no JSON output')
}

async function runJavaBridge(command: string, args: string[]): Promise<JavaBridgeResult> {
  await ensureJavaBridgeCompiled()

  const { javaRoot, classesDir, iaMathJar } = getJavaPaths()
  const javaExec = resolveJavaTool('java')
  const classPath = [classesDir, iaMathJar].join(path.delimiter)

  try {
    const { stdout, stderr } = await execFileAsync(
      javaExec,
      ['-cp', classPath, 'src.apps.DatConCliBridge', command, ...args],
      { cwd: javaRoot, windowsHide: true }
    )

    const combinedOutput = [stdout, stderr].filter(Boolean).join('\n')
    return parseJsonLine(combinedOutput)
  } catch (error: any) {
    const combinedOutput = [error?.stdout, error?.stderr, error?.message]
      .filter(Boolean)
      .join('\n')

    try {
      return parseJsonLine(combinedOutput)
    } catch {
      throw new Error(combinedOutput || 'Java bridge execution failed')
    }
  }
}

export async function analyzeDatFile(filePath: string): Promise<ParseResult> {
  const result = await runJavaBridge('analyze', [filePath])
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Java analyze failed')
  }

  return {
    ...result.data,
    records: result.data.records || []
  }
}

/**
 * Export to KML format
 * @param filePath Path to DAT file
 * @param options Export options (ground track / profile)
 * @returns Path to generated KML file
 */
export async function exportToKML(filePath: string, options: any): Promise<string> {
  const outputDir = options?.outputDir ? options.outputDir : path.dirname(filePath)
  const kmlMode = options?.type === 'profile' ? 'profile' : 'groundtrack'
  const bridgeArgs = [filePath, outputDir, kmlMode]
  if (kmlMode === 'profile' && Number.isFinite(options?.homePointElevationMeters)) {
    bridgeArgs.push(String(options.homePointElevationMeters))
  }
  const result = await runJavaBridge('export-kml', bridgeArgs)
  if (!result.success || !result.path) {
    throw new Error(result.error || 'Java KML export failed')
  }
  return result.path
}

/**
 * Export to CSV format
 * @param filePath Path to DAT file
 * @param options Export options
 * @returns Path to generated CSV file
 */
export async function exportToCSV(filePath: string, options: any): Promise<string> {
  const outputDir = options?.outputDir ? options.outputDir : path.dirname(filePath)
  const result = await runJavaBridge('export-csv', [filePath, outputDir])
  if (!result.success || !result.path) {
    throw new Error(result.error || 'Java CSV export failed')
  }
  return result.path
}
