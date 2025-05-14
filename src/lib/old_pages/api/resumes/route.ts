import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function GET() {
  try {
    const resumesDir = path.join(process.cwd(), 'src', 'data', 'resumes');
    
    // Check if the directory exists, create if not
    if (!fs.existsSync(resumesDir)) {
      await fsPromises.mkdir(resumesDir, { recursive: true });
      return NextResponse.json({ resumes: [] });
    }
    
    // Read the resumes directory
    const files = await fsPromises.readdir(resumesDir);
    
    // Filter for markdown files only
    const resumes = files
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        filename: file.replace('.md', ''),
        path: `/resumes/${file.replace('.md', '')}`,
        fullPath: `${resumesDir}/${file}`
      }));
    
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error listing resumes:', error);
    return NextResponse.json(
      { error: 'Failed to list resumes' },
      { status: 500 }
    );
  }
}