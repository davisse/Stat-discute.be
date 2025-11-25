import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    const scriptPath = '/Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/fetch_pinnacle_odds.py'

    // Execute Python script
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`)

    // Check if there were any errors in stderr
    if (stderr && !stderr.includes('UserWarning')) {
      console.warn('Script stderr:', stderr)
    }

    return Response.json({
      success: true,
      message: 'Scraping completed successfully',
      output: stdout
    })
  } catch (error: any) {
    console.error('Scraping error:', error)
    return Response.json({
      success: false,
      error: error.message,
      details: error.stderr || error.stdout
    }, { status: 500 })
  }
}
