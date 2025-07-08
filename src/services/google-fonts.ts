import { SYSTEM_FONTS } from "@/lib/utils/styles";

/**
 * Service for managing Google Fonts.
 * This class handles the logic for dynamically loading Google Fonts into the document
 * and tracking which fonts have already been loaded to avoid redundant requests.
 */
export class GoogleFontsService {
  private static loadedFonts = new Set<string>();

  /**
   * Constructs the URL for the Google Fonts API for a given font family.
   * It returns null for system fonts, which should not be fetched.
   * @param fontFamily - The name of the font family (e.g., "Roboto").
   * @returns The full URL for the font stylesheet, or null if it's a system font.
   */
  private getFontUrl(fontFamily: string): string | null {
    if (SYSTEM_FONTS.includes(fontFamily)) {
      return null;
    }
    const formattedFontFamily = fontFamily.replace(/ /g, "+");
    return `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@300;400;500;600;700&display=swap`;
  }

  /**
   * Checks if a font is already available in the document.
   * This check relies on both the browser's font detection (`document.fonts.check`)
   * and an internal tracker for fonts loaded by this service.
   * @param fontFamily - The font family to check.
   * @returns `true` if the font is available, `false` otherwise.
   */
  public isFontLoaded(fontFamily: string): boolean {
    // Check our internal cache first, then the browser's font set.
    return (
      GoogleFontsService.loadedFonts.has(fontFamily) ||
      document.fonts.check(`1em "${fontFamily}"`)
    );
  }

  /**
   * Loads a Google Font by dynamically injecting a <link> tag into the document's head.
   * It avoids reloading fonts that are already available.
   * @param fontFamily - The font family to load from Google Fonts.
   * @returns A promise that resolves when the font is successfully loaded or if it's
   * already available, and rejects if the font fails to load.
   */
  public async loadFont(fontFamily: string): Promise<void> {
    if (!fontFamily || this.isFontLoaded(fontFamily)) {
      return Promise.resolve();
    }

    const fontUrl = this.getFontUrl(fontFamily);

    // If there's no URL, it's a system font. Mark as loaded and resolve.
    if (!fontUrl) {
      GoogleFontsService.loadedFonts.add(fontFamily);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fontUrl;

      link.onload = () => {
        GoogleFontsService.loadedFonts.add(fontFamily);
        resolve();
      };

      link.onerror = (event) => {
        console.error(`Failed to load Google Font: ${fontFamily}`, event);
        reject(new Error(`Failed to load font: ${fontFamily}`));
      };

      document.head.appendChild(link);
    });
  }
}

/**
 * A singleton instance of the GoogleFontsService for easy access throughout the application.
 */
export const googleFontsService = new GoogleFontsService();
