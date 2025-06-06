"use client";
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
import { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-accent via-muted to-accent dark:from-muted dark:via-card dark:to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-ring/10 blur-3xl"></div>
        <div
          className={`relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-muted/50 rounded-full text-muted-foreground text-sm font-medium border border-border/50">
            <Sparkles className="h-4 w-4" />
            <span>Trusted by 50,000+ job seekers</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-foreground bg-clip-text text-transparent mb-6 leading-tight">
            Land Your Dream Job
            <br />
            <span className="text-4xl md:text-6xl">with Perfect Resumes</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8 leading-relaxed">
            Create ATS-optimized, professional resumes using Markdown.
            <br className="hidden md:block" />
            <span className="text-primary font-semibold">
              Built by hiring managers, loved by job seekers.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link
              href="/resumes"
              className="bg-primary text-primary-foreground rounded text-center flex items-center justify-center hover:bg-primary/90 m-px py-3 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Create Your Resume
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-2 hover:bg-accent"
            >
              View Examples
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl">
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
        className="py-20 px-4 max-w-6xl mx-auto space-y-20 scroll-mt-20 flex flex-col items-center justify-center"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Why Choose Our AI Resume Builder?
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Our platform is designed to give you a competitive edge in your job
            search.
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
                Choose from a variety of modern, ATS-friendly templates designed
                by experts.
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
      <div className="py-20 bg-gradient-to-br from-muted to-accent">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            Loved by Job Seekers Everywhere
          </h2>

          <Card className="bg-card/80 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <Star className="h-5 w-5 fill-chart-4 text-chart-4 inline" />
                <Star className="h-5 w-5 fill-chart-4 text-chart-4 inline" />
                <Star className="h-5 w-5 fill-chart-4 text-chart-4 inline" />
                <Star className="h-5 w-5 fill-chart-4 text-chart-4 inline" />
                <Star className="h-5 w-5 fill-chart-4 text-chart-4 inline" />
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
      <div className="py-20 px-4 max-w-6xl mx-auto">
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

      {/* CTA Section */}
      <div className="py-20 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful job seekers who trust our resume
            builder
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-12 py-6 text-lg font-semibold hover:shadow-xl transition-all duration-300 group"
          >
            Start Building Now - It&apos;s Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm mt-4 opacity-75">
            No signup required • Start creating immediately
          </p>
        </div>
      </div>
    </div>
  );
}
