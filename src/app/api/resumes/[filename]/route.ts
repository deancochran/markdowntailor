import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { sanitizeFilename, getResumeFileExtension } from '../../../../utils/resumeUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const sanitizedFilename = sanitizeFilename(filename);
    const extension = getResumeFileExtension(sanitizedFilename);
    const filePath = path.join(process.cwd(), 'src', 'data', 'resumes', `${sanitizedFilename}${extension}`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Resume '${sanitizedFilename}' not found` },
        { status: 404 }
      );
    }

    // Read the file content
    const fileContent = await fsPromises.readFile(filePath, 'utf-8');
    
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/markdown',
      },
    });
  } catch (error) {
    console.error('Error reading resume file:', error);
    return NextResponse.json(
      { error: 'Failed to read resume file' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const sanitizedFilename = sanitizeFilename(filename);
    const extension = getResumeFileExtension(sanitizedFilename);
    const markdown = await request.text();
    const filePath = path.join(process.cwd(), 'src', 'data', 'resumes', `${sanitizedFilename}${extension}`);

    // Create directories if they don't exist
    const dir = path.dirname(filePath);
    await fsPromises.mkdir(dir, { recursive: true });

    // Write the markdown content to the file
    await fsPromises.writeFile(filePath, markdown, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving resume file:', error);
    return NextResponse.json(
      { error: 'Failed to save resume file' },
      { status: 500 }
    );
  }
}

// Using the imported sanitizeFilename function instead of defining it here