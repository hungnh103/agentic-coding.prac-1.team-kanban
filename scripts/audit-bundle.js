const fs = require("fs").promises
const path = require("path")
const zlib = require("zlib")

function gzip(buffer) {
  return new Promise((resolve, reject) => {
    zlib.gzip(buffer, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

async function listFiles(dir, ext = ".js") {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, ext)))
    } else if (entry.isFile() && fullPath.endsWith(ext)) {
      files.push(fullPath)
    }
  }
  return files
}

async function analyze() {
  const root = process.cwd()
  const chunkDir = path.join(root, ".next", "static", "chunks")
  try {
    const files = await listFiles(chunkDir, ".js")
    const results = []

    for (const file of files) {
      const buffer = await fs.readFile(file)
      const gzipBuffer = await gzip(buffer)
      results.push({
        file: path.relative(root, file),
        size: buffer.length,
        gzipSize: gzipBuffer.length,
      })
    }

    results.sort((a, b) => b.gzipSize - a.gzipSize)
    console.log("Bundle size audit results:")
    console.log("Top 15 JS assets by gzip size:")
    for (const item of results.slice(0, 15)) {
      console.log(
        `${item.gzipSize.toLocaleString()} bytes gzipped — ${item.file}`
      )
    }

    const totalGzip = results.reduce((sum, item) => sum + item.gzipSize, 0)
    console.log(`\nTotal JS gzip size: ${totalGzip.toLocaleString()} bytes`)
    console.log(`Total JS gzip size ≈ ${(totalGzip / 1024).toFixed(2)} KiB`)

    const criticalThreshold = 250 * 1024
    if (totalGzip > criticalThreshold) {
      console.warn(
        `WARNING: Total gzipped JS size exceeds ${criticalThreshold.toLocaleString()} bytes.`
      )
      process.exitCode = 1
    }
  } catch (error) {
    console.error("Failed to run bundle audit:", error)
    process.exitCode = 1
  }
}

analyze()
