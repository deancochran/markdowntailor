"use client";
import AppFooter from "@/components/AppFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TEMPLATES } from "@/lib/utils/templates";
import {
  ArrowRight,
  FileDown,
  FileEdit,
  GitFork,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(true); // Start as true to match server render
  const [_mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add a small delay before starting animations to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-accent via-muted to-accent dark:from-muted dark:via-card dark:to-muted">
      <div className="flex flex-col gap-24 py-12 md:py-32 px-4 max-w-full">
        {/* Hero Section */}
        <div className="relative ">
          <div
            className={`relative flex flex-col items-center justify-evenly gap-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex flex-col gap-4 items-center justify-center text-center ">
              <h1 className="text-5xl font-bold bg-foreground bg-clip-text text-transparent leading-tight">
                Pixel. Perfect. Resumes.
              </h1>
              <p className="text-lg max-w-sm md:max-w-full md:text-2xl text-muted-foreground leading-relaxed">
                Create beautiful, professional resumes with ease.
              </p>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section
          id="features"
          className="px-4 max-w-6xl mx-auto space-y-10 scroll-mt-20 flex flex-col items-center justify-center"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Create Your Resume?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Our platform is designed to help you create professional,
              ATS-optimized resumes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Style",
                description:
                  "Pick from professionally designed templates optimized for your industry",
              },
              {
                step: "02",
                title: "Write with Markdown",
                description:
                  "Use simple formatting to create your resume.",
              },
              {
                step: "03",
                title: "Export & Apply",
                description:
                  "Download your professional PDF resume for your applications",
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <Button asChild className="mb-8 " size="lg">
            <Link href="/resumes">
              Get Started Today <ArrowRight />
            </Link>
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Palette className="h-8 w-8 text-primary" />
                <CardTitle>Professional Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose from a variety of modern, ATS-friendly templates
                  designed by experts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FileEdit className="h-8 w-8 text-primary" />
                <CardTitle>Effortless Editing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Edit your resume using a simple interface or Markdown, with a
                  live preview of changes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FileDown className="h-8 w-8 text-primary" />
                <CardTitle>PDF Export</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate professional PDFs with a single click, ready for your
                  application needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <GitFork className="h-8 w-8 text-primary" />
                <CardTitle>Version Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easily create and manage multiple resume versions tailored for
                  different job applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Templates Section */}
        <section className="px-4 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Professional Templates
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Every template is pixel-perfect, ATS-optimized, and ready to be
              updated with your content.
            </p>
          </div>
          <div className="text-center">
            <Button className="px-8 py-4 text-lg" size="lg" asChild>
              <Link href="/templates">
                Browse All Templates
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2  gap-6">
            {TEMPLATES.slice(0, 6).map((template, index) => (
              <Link key={index} href={`/templates?slug=${template.slug}`}>
                <Card className="bg-card max-h-full h-full  group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="justify-between">
                    <p className="text-muted-foreground mb-4">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}
