"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full h-14 items-center justify-between">
        <div className="hidden md:flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Resume Builder</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/resumes"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              My Resumes
            </Link>
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Resume Builder</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              <Link
                href="/"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/resumes"
                className="text-foreground/60 hover:text-foreground transition-colors"
              >
                My Resumes
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center">
          <nav className="flex items-center space-x-2">
            <Link href="/resumes">
              <Button variant="outline">My Resumes</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
