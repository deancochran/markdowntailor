"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Brain,
  FileDown,
  FileEdit,
  GitFork,
  Palette,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Alpha Program Banner Component
function AlphaProgramBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [programStatus, setProgramStatus] = useState<
    "before" | "active" | "ended"
  >("before");
  const [mounted, setMounted] = useState(false);

  // Set your alpha program dates here - memoized to prevent unnecessary re-renders
  const ALPHA_START_DATE = useMemo(() => new Date("2025-07-01T00:00:00Z"), []);
  const ALPHA_END_DATE = useMemo(() => new Date("2025-07-31T23:59:59Z"), []);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = ALPHA_START_DATE.getTime();
      const endTime = ALPHA_END_DATE.getTime();

      if (now < startTime) {
        // Before alpha starts - countdown to start
        const difference = startTime - now;
        setProgramStatus("before");
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } else if (now >= startTime && now <= endTime) {
        // During alpha - countdown to end
        const difference = endTime - now;
        setProgramStatus("active");
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      } else {
        // After alpha ends
        setProgramStatus("ended");
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [ALPHA_START_DATE, ALPHA_END_DATE]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const getBannerContent = () => {
    switch (programStatus) {
      case "before":
        return {
          title: "🚀 Alpha Program Starting Soon!",
          badgeText: "COMING SOON",
          badgeVariant: "secondary" as const,
          showCountdown: true,
          countdownLabel: "Starts in:",
        };
      case "active":
        return {
          title: "🔥 Alpha Program Live Now!",
          badgeText: "LIVE NOW",
          badgeVariant: "destructive" as const,
          showCountdown: true,
          countdownLabel: "Ends in:",
        };
      case "ended":
        return {
          title: "Alpha Program Has Ended",
          badgeText: "PROGRAM ENDED",
          badgeVariant: "outline" as const,
          showCountdown: false,
          countdownLabel: "",
        };
    }
  };

  const content = getBannerContent();

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20 p-1">
      <div className="w-full h-full p-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex flex-col items-start gap-1">
          <Badge variant={content.badgeVariant} className="font-semibold">
            {content.badgeText}
          </Badge>
          <h3 className="text-lg font-bold text-foreground">{content.title}</h3>
        </div>

        {content.showCountdown && (
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-muted-foreground">
              {content.countdownLabel}
            </div>
            <div className="flex gap-1">
              {timeLeft.days > 0 && (
                <div className="bg-primary/10 rounded-lg  text-center min-w-[50px]">
                  <div className="text-lg font-bold text-primary">
                    {timeLeft.days}
                  </div>
                  <div className="text-xs text-muted-foreground">DAYS</div>
                </div>
              )}
              <div className="bg-primary/10 rounded-lg  text-center min-w-[50px]">
                <div className="text-lg font-bold text-primary">
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-muted-foreground">HRS</div>
              </div>
              <div className="bg-primary/10 rounded-lg  text-center min-w-[50px]">
                <div className="text-lg font-bold text-primary">
                  {timeLeft.minutes}
                </div>
                <div className="text-xs text-muted-foreground">MIN</div>
              </div>
              <div className="bg-primary/10 rounded-lg  text-center min-w-[50px]">
                <div className="text-lg font-bold text-primary">
                  {timeLeft.seconds}
                </div>
                <div className="text-xs text-muted-foreground">SEC</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModernLandingPage() {
  const [isVisible, setIsVisible] = useState(true); // Start as true to match server render
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [_mounted, setMounted] = useState(false);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      text: "Landed 3 interviews in my first week using this resume builder. The ATS optimization really works!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Manager",
      company: "Spotify",
      text: "Finally, a resume builder that doesn't look like everyone else's. Clean, professional, and easy to customize.",
      rating: 5,
    },
    {
      name: "Emily Park",
      role: "UX Designer",
      company: "Airbnb",
      text: "The Markdown editing is genius. I can focus on content while it handles the formatting perfectly.",
      rating: 5,
    },
  ];

  // Static stats to avoid hydration issues
  const stats = [
    { number: "50K+", label: "Resumes Created" },
    { number: "89%", label: "Interview Rate" },
    { number: "500+", label: "Companies Hiring" },
    { number: "4.9/5", label: "User Rating" }, // Use static stars
  ];

  useEffect(() => {
    setMounted(true);
    // Add a small delay before starting animations to ensure hydration is complete
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [testimonials.length]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-accent via-muted to-accent dark:from-muted dark:via-card dark:to-muted">
      {/* Alpha Program Banner */}
      <AlphaProgramBanner />

      <main className="flex-grow flex flex-col gap-20 py-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div
            className={`relative flex flex-col items-center align-middle justify-evenly gap-8 px-16 py-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center gap-1 px-4 py-2 bg-muted/50 rounded-full text-muted-foreground text-sm font-medium border border-border/50">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 50,000+ job seekers</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center ">
              <h1 className="text-5xl md:text-7xl font-bold bg-foreground bg-clip-text text-transparent leading-tight">
                Land Your Dream Job
              </h1>
              <p className="text-lg max-w-sm md:max-w-full md:text-2xl text-muted-foreground  leading-relaxed">
                Create ATS-optimized, professional resumes using Markdown.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="px-8 w-full " size={"lg"} asChild>
                <Link href="/resumes">
                  Create Your Resume
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <section
          id="features"
          className="px-4 max-w-6xl mx-auto space-y-20 scroll-mt-20 flex flex-col items-center justify-center"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose markdowntailor?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Our platform is designed to give you a competitive edge in your
              job search.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                <CardTitle>Intelligent Tailoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes job descriptions to help you customize your
                  resume, significantly boosting your chances.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                <CardTitle>AI Content Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive AI-driven suggestions for impactful phrasing, action
                  verbs, and keyword optimization.
                </p>
              </CardContent>
            </Card>

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
                <CardTitle>Multiple Export Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate professional PDFs or HTML documents with a single
                  click, ready for any application.
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

        {/* Testimonials */}
        <div>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-12">
              Loved by Job Seekers Everywhere
            </h2>

            <Card className="bg-card/80 backdrop-blur border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 inline" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 inline" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 inline" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 inline" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 inline" />
                </div>
                <blockquote className="text-xl text-muted-foreground mb-6 italic">
                  &quot;{testimonials[currentTestimonial].text}&quot;
                </blockquote>
                <div className="font-semibold text-foreground">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-muted-foreground">
                  {testimonials[currentTestimonial].role} at{" "}
                  {testimonials[currentTestimonial].company}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-muted-foreground">
              From zero to hired-ready resume in 3 simple steps
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
                  "Use simple formatting while our AI suggests improvements and catches errors",
              },
              {
                step: "03",
                title: "Export & Apply",
                description:
                  "Download your perfect PDF and start landing interviews immediately",
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
        </div>
        {/* Final Call to Action */}
        <div className="px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <Button className="px-8 py-4 text-lg " size={"lg"} asChild>
            <Link href="/resumes">
              Start Building Your Resume Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4 flex flex-col items-start justify-between">
              <h3 className="text-xl font-bold text-foreground">
                markdowntailor
              </h3>
              <div className="items-start flex flex-col justify-end">
                <p className="text-muted-foreground mt-2 text-sm">
                  &copy; {new Date().getFullYear()} markdowntailor&trade;
                </p>
                <p className="text-muted-foreground text-sm">
                  All rights reserved.
                </p>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Product</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#features"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Templates
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary"
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
    </div>
  );
}
