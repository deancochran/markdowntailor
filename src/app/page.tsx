"use client";
import AppFooter from "@/components/AppFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES } from "@/lib/utils/templates";
import {
  ArrowRight,
  Brain,
  FileDown,
  FileEdit,
  GitFork,
  Palette,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Alpha Program Banner Component
function AlphaProgramBanner() {
  const [_timeLeft, setTimeLeft] = useState({
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
  const ALPHA_START_DATE = useMemo(() => new Date("2025-06-01T00:00:00Z"), []);
  const ALPHA_END_DATE = useMemo(
    () =>
      new Date(process.env.ALPHA_ACCESS_CUTOFF_DATE ?? "2025-08-01T00:00:00Z"),
    [],
  );

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
        <div className="w-full flex flex-col items-start gap-1">
          <Badge
            variant={content.badgeVariant}
            className="font-semibold text-sm"
          >
            {content.badgeText}
          </Badge>
          <h3 className="text-sm font-bold text-foreground">{content.title}</h3>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(true); // Start as true to match server render
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [_mounted, setMounted] = useState(false);

  // Updated testimonials that avoid making promises about job outcomes
  const testimonials = [
    {
      text: "The Markdown format makes it so easy to organize my experience. I appreciate how clean and professional the templates look.",
      author: "John Doe",
      position: "Software Engineer",
      company: "ABC Corp",
    },
    {
      text: "I love how I can quickly create different versions of my resume for different industries. The ATS-friendly format gives me confidence when applying.",
      author: "Jane Smith",
      position: "Marketing Manager",
      company: "XYZ Inc",
    },
    {
      text: "The AI suggestions helped me highlight my achievements with stronger action verbs. Very intuitive interface!",
      author: "Alice Johnson",
      position: "Product Manager",
      company: "DEF Ltd",
    },
    {
      text: "Being able to use Markdown for my resume is perfect for a developer like me. The templates are clean and modern.",
      author: "Bob Brown",
      position: "Full Stack Developer",
      company: "GHI Tech",
    },
    {
      text: "The keyword suggestions helped me tailor my resume to match the job descriptions much more effectively.",
      author: "Charlie Davis",
      position: "UX Designer",
      company: "LMN Design",
    },
    {
      text: "The version control feature is invaluable for keeping track of different resume versions for different positions.",
      author: "David Miller",
      position: "Project Manager",
      company: "OPQ Corp",
    },
    {
      text: "As someone who cares about design, I'm impressed with how professional and well-designed the templates are.",
      author: "Emily Wilson",
      position: "UI Designer",
      company: "PQR Studio",
    },
    {
      text: "The AI suggestions helped me translate my industry-specific experience into more universally understood achievements.",
      author: "Frank Garcia",
      position: "Marketing Manager",
      company: "STU Inc.",
    },
    {
      text: "The structured format helps me organize my publications and research experience in a clean, readable way.",
      author: "Grace Kim",
      position: "Research Scientist",
      company: "XYZ Labs",
    },
    {
      text: "I appreciate how easy it is to highlight my metrics and achievements with the formatting options.",
      author: "Hannah Lee",
      position: "Data Analyst",
      company: "ABC Corp",
    },
    {
      text: "The technical skills section formatting is perfect for showcasing my certifications and expertise.",
      author: "Ian Chen",
      position: "Software Engineer",
      company: "DEF Tech",
    },
    {
      text: "As someone new to the job market, the AI suggestions helped me present my limited experience in the most effective way.",
      author: "John Doe",
      position: "Entry-Level Developer",
      company: "GHI Corp",
    },
    {
      text: "The templates helped me create a professional resume that highlights my leadership experience and community impact.",
      author: "Jane Smith",
      position: "Community Manager",
      company: "JKL Inc.",
    },
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
    <div className="w-full bg-gradient-to-br from-accent via-muted to-accent dark:from-muted dark:via-card dark:to-muted">
      {/* Alpha Program Banner */}
      <AlphaProgramBanner />

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
                Trusted by Job Seekers Worldwide
              </p>
            </div>
            <Card className="max-w-3xl p-8">
              <CardContent className="flex flex-col gap-4 justify-between">
                <blockquote className="text-xl text-muted-foreground italic">
                  &quot;{testimonials[currentTestimonial].text}&quot;
                </blockquote>
                {/* <span className="w-full text-right text-xl text-muted-foreground italic">
                  - {testimonials[currentTestimonial].author}
                  {" | "}
                  {testimonials[currentTestimonial].position}
                  {" @ "}
                  {testimonials[currentTestimonial].company}{" "}
                </span> */}
              </CardContent>
            </Card>
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
                  "Use simple formatting while our AI suggests improvements and catches errors",
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
                <Brain className="h-8 w-8 text-primary" />
                <CardTitle>Intelligent Tailoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes job descriptions to help you customize your
                  resume with relevant keywords and skills.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
