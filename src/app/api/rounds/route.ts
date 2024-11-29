import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
    try {
        // Get the request body
        const body = await request.json()

        // Get the path to data.json
        const filePath = path.join(process.cwd(), 'public/data.json')
        const dirPath = path.dirname(filePath)

        // Ensure the directory exists
        await fs.mkdir(dirPath, { recursive: true })

        // Read existing data
        let existingData = []
        try {
            const fileContent = await fs.readFile(filePath, 'utf8')
            existingData = JSON.parse(fileContent)
        } catch {
            // If file doesn't exist or is empty, start with empty array
            existingData = []
        }

        // Add new data
        existingData.push({
            ...body,
            id: Date.now(), // Add unique ID
            createdAt: new Date().toISOString()
        })

        // Write updated data back to the file
        await fs.writeFile(filePath, JSON.stringify(existingData, null, 2))

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: "ERROR" }, { status: 500 })
    }
}