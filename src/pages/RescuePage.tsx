import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LifeBuoy, Plus, Trash2, Send, AlertTriangle, Phone, Mail } from "lucide-react";
import { z } from "zod";

interface Problem {
  title: string;
  description: string;
}

const rescueSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(100).optional(),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  additional_notes: z.string().trim().max(2000).optional(),
}).refine(
  (data) => (data.email && data.email.length > 0) || (data.phone && data.phone.length > 0),
  { message: "At least one contact method (email or phone) is required", path: ["email"] }
).refine(
  (data) => !data.email || z.string().email().safeParse(data.email).success,
  { message: "Invalid email address", path: ["email"] }
);

const urgencyConfig = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", color: "bg-primary/20 text-primary" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-600" },
  critical: { label: "Critical", color: "bg-destructive/20 text-destructive" },
};

const RescuePage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [problems, setProblems] = useState<Problem[]>([{ title: "", description: "" }]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addProblem = () => {
    if (problems.length < 10) {
      setProblems([...problems, { title: "", description: "" }]);
    }
  };

  const removeProblem = (index: number) => {
    if (problems.length > 1) {
      setProblems(problems.filter((_, i) => i !== index));
    }
  };

  const updateProblem = (index: number, field: keyof Problem, value: string) => {
    const updated = [...problems];
    updated[index] = { ...updated[index], [field]: value };
    setProblems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate problems
    const validProblems = problems.filter(p => p.title.trim() || p.description.trim());
    if (validProblems.length === 0) {
      setErrors({ problems: "Please describe at least one problem" });
      return;
    }

    const result = rescueSchema.safeParse({ name, email: email || undefined, phone: phone || undefined, company: company || undefined, urgency, additional_notes: additionalNotes || undefined });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("submit-form", {
        body: {
          form_type: "rescue",
          data: {
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            company: company.trim() || null,
            urgency,
            problems: validProblems.map(p => ({ title: p.title.trim(), description: p.description.trim() })),
            additional_notes: additionalNotes.trim() || null,
          },
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setSubmitted(true);
      toast.success("Your rescue request has been submitted! We'll get back to you soon.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <SEO title="Rescue Request Sent | Georges Boutros" description="Your rescue request has been submitted successfully." noindex />
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container-custom max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <LifeBuoy className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Request Submitted!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for reaching out. I'll review your request and get back to you as soon as possible.
              </p>
              <Button onClick={() => { setSubmitted(false); setName(""); setEmail(""); setPhone(""); setCompany(""); setUrgency("medium"); setProblems([{ title: "", description: "" }]); setAdditionalNotes(""); }}>
                Submit Another Request
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Quick Rescue | Georges Boutros - Get Help With Your Technical Problems"
        description="Facing a technical challenge? Submit your problem and get expert help from Georges Boutros. Quick response for urgent web development and data engineering issues."
        keywords="technical help, web development rescue, urgent developer help, Georges Boutros, Lebanon developer"
        canonical="https://gib-two.vercel.app/rescue"
        breadcrumbs={[
          { name: "Home", url: "https://gib-two.vercel.app" },
          { name: "Quick Rescue", url: "https://gib-two.vercel.app/rescue" }
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Quick Rescue - Technical Problem Submission",
          "description": "Submit your technical problems for expert review and fast resolution by Georges Boutros.",
          "url": "https://gib-two.vercel.app/rescue",
          "mainEntity": {
            "@type": "Service",
            "serviceType": "Technical Rescue",
            "provider": {
              "@type": "Person",
              "name": "Georges Boutros",
              "url": "https://gib-two.vercel.app"
            },
            "areaServed": { "@type": "Place", "name": "Worldwide" },
            "description": "Quick technical rescue service for urgent web development and data engineering problems."
          }
        }}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="section-padding bg-destructive/5 border-b border-border">
          <div className="container-custom text-center max-w-3xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <LifeBuoy className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Quick Rescue</h1>
            <p className="text-lg text-muted-foreground">
              Got a technical problem that needs attention? Describe your issue below and I'll review it and get back to you with a solution plan.
            </p>
          </div>
        </motion.section>

        {/* Form */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="section-padding">
          <div className="container-custom max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Mail className="w-5 h-5 text-primary" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+961 ..." maxLength={30} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">* At least one contact method (email or phone) is required.</p>
                  <div>
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" maxLength={100} />
                  </div>
                </CardContent>
              </Card>

              {/* Urgency */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    Urgency Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={urgency} onValueChange={(v) => setUrgency(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(urgencyConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Problems */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xl">
                      <LifeBuoy className="w-5 h-5 text-primary" />
                      Describe Your Problem(s)
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={addProblem} disabled={problems.length >= 10}>
                      <Plus className="w-4 h-4 mr-1" /> Add Problem
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {errors.problems && <p className="text-sm text-destructive">{errors.problems}</p>}
                  {problems.map((problem, index) => (
                    <div key={index} className="relative border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Problem #{index + 1}</Label>
                        {problems.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeProblem(index)} className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`problem-title-${index}`}>Title</Label>
                        <Input
                          id={`problem-title-${index}`}
                          value={problem.title}
                          onChange={(e) => updateProblem(index, "title", e.target.value)}
                          placeholder="Brief problem title"
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`problem-desc-${index}`}>Description</Label>
                        <Textarea
                          id={`problem-desc-${index}`}
                          value={problem.description}
                          onChange={(e) => updateProblem(index, "description", e.target.value)}
                          placeholder="Describe the problem in detail..."
                          rows={3}
                          maxLength={2000}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Additional Notes (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional context, deadlines, or preferences..."
                    rows={4}
                    maxLength={2000}
                  />
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Rescue Request"}
              </Button>
            </form>
          </div>
        </motion.section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default RescuePage;
