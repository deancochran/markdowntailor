ALTER TABLE "resume_versions" ALTER COLUMN "markdown" SET DEFAULT '
  # Hello World

  Welcome to your resume!

  You can customize this template to fit your needs.

  ## Using Markdown

  In markdown, you can use headers, lists, bold, italics, and lots of formatting options.

  ### Headers

  Use # for headers.

  ### Lists

  Use * for unordered lists.

  ### Formatting

  Use ** for bold text and * for italic text.

  ### More

  Check out the [Markdown Guide](https://www.markdownguide.org/) for more information.

  ## Using HTML in Markdown

  You can also use HTML tags within markdown to add more complex formatting.

  ### Example

  <div>
    <h3>Custom Background</h3>
    <p>This is a paragraph with a custom background color.</p>
  </div>

  ## Styling HTML in Markdown

  You can style HTML elements using CSS within markdown.

  ### Example

  <div style="background-color: #f0f0f0; padding: 10px;">
    <h3>Styled Background</h3>
    <p>This is a paragraph with a styled background color.</p>
  </div>

  With MarkdownTailor, you can easily style your resume using inline HTML syles
  as seen above, or you can use css.

  #### Updated HTML

  <div class="custom-background custom-text">
    <h3>Styled Background</h3>
    <p>This is a paragraph with a styled background color.</p>
  </div>

  #### CSS for HTML

  .custom-background {
    background-color: #f0f0f0;
    padding: 10px;
  }

  .custom-text {
    color: #ff0000;
    font-weight: bold;
  }
  ';--> statement-breakpoint
ALTER TABLE "resume_versions" ALTER COLUMN "css" SET DEFAULT '
  body {
    margin: 0;
    padding: 20px;
    font-family: ''Inter'', -apple-system, BlinkMacSystemFont, ''Segoe UI'', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background: white;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 16px;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  h4 {
    font-size: 14px;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  ul {
    padding-left: 20px;
  }

  /* More default styles... */
';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "model_preference" SET DEFAULT 'o4-mini';