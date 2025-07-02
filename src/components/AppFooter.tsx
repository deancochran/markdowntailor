import Link from "next/link";
export default function AppFooter() {
  return (
    <footer className="border-t border-border/50 w-full">
      <div className="h-full max-w-7xl mx-auto px-4 py-6">
        {/* Mobile-friendly footer layout */}
        <div className="w-full h-full flex flex-row flex-wrap items-start justify-start gap-4">
          {/* Logo and copyright - top section */}
          <div className="h-fit flex flex-col items-start justify-start">
            <Link href="/" className="text-xl font-bold text-foreground">
              markdowntailor
            </Link>

            {/* All rights reserved - at the bottom */}
            <div>
              <p className="text-muted-foreground mt-2 text-xs whitespace-nowrap">
                &copy; {new Date().getFullYear()} markdowntailor&trade;
              </p>
              <p className="text-xs text-muted-foreground">
                All rights reserved.
              </p>
            </div>
          </div>

          {/* Links in flexible grid for mobile devices */}
          <div className="grow flex flex-row flex-wrap space-x-8 gap-8 items-start sm:justify-end justify-start">
            {/* First column - small screens get 2 columns */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm">
                Product
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/features"
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm">
                Company
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/blog"
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>
            {/* Legal links - most important for visibility on mobile */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm">
                Legal
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-xs md:text-sm text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
