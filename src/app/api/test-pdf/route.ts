import { NextResponse } from 'next/server';

/**
 * This endpoint tests PDF generation capabilities by creating a simple HTML file
 * that can be downloaded and viewed as a PDF.
 */
export async function GET() {
  try {
    // Generate a basic HTML document with resume styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PDF Test Document</title>
          <style>
            @page { size: letter; margin: 0.5in; }
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              color: #333;
            }
            .container {
              max-width: 100%;
              padding: 0;
            }
            h1 {
              font-size: 24pt;
              margin-bottom: 0.2rem;
              color: #0066cc;
            }
            p {
              margin-bottom: 1rem;
            }
            .test-block {
              background-color: #f5f5f5;
              border: 1px solid #ddd;
              padding: 10px;
              margin-bottom: 10px;
            }
          </style>
        </head>
<body>
          <div class="container">
            <h1>PDF Generation Test</h1>
            <p>This document tests the PDF generation capabilities of the application.</p>
            
            <div class="test-block">
              <p><b>Time generated:</b> ${new Date().toLocaleString()}</p>
              <p><b>Test ID:</b> ${Math.random().toString(36).substring(2, 15)}</p>
            </div>
            
            <h2>Text Formatting</h2>
            <p>
              This paragraph tests <b>bold text</b>, <i>italic text</i>, and <u>underlined text</u>.
              It also tests <code>monospaced text</code> for code examples.
            </p>
            
            <h2>List Test</h2>
            <ul>
              <li>Item 1</li>
              <li>Item 2 with <b>bold text</b></li>
              <li>Item 3 with <a href="#">a link</a></li>
            </ul>
            
            <h2>Table Test</h2>
            <table border="1" cellpadding="5" style="border-collapse: collapse;">
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
              </tr>
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

    // Return the HTML content with appropriate headers
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="pdf-test.html"',
      },
    });
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate test PDF' },
      { status: 500 }
    );
  }
}