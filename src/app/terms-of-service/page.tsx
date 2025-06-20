import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="h-8 w-8" />
              <CardTitle className="text-3xl font-bold">
                Terms of Service
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent className="max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-3">
                <p>
                  By accessing and using our resume builder service
                  (&quot;Service&quot;), you accept and agree to be bound by the
                  terms and provision of this agreement. If you do not agree to
                  abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service (&quot;Terms&quot;) govern your use of
                  our website and services operated by Resume Builder
                  (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <div className="space-y-3">
                <p>Our Service provides:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Online resume creation and editing tools</li>
                  <li>Professional resume templates and formatting</li>
                  <li>PDF generation and download capabilities</li>
                  <li>Cloud storage for your resume data</li>
                  <li>Account management and profile settings</li>
                </ul>
                <p>
                  The Service may be modified, suspended, or discontinued at any
                  time with or without notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. User Accounts and Registration
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Account Creation</h3>
                <p>
                  To use certain features of our Service, you must create an
                  account by providing:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A valid email address</li>
                  <li>A secure password</li>
                  <li>Any other required information</li>
                </ul>
                <h3 className="text-xl font-medium">Account Security</h3>
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Maintaining the confidentiality of your account credentials
                  </li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>
                    Ensuring your account information is accurate and up-to-date
                  </li>
                </ul>
                <h3 className="text-xl font-medium">Account Termination</h3>
                <p>Accounts may be suspended or terminated if users:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Violate these Terms of Service</li>
                  <li>Use the Service for illegal or unauthorized purposes</li>
                  <li>Engage in abusive or disruptive behavior</li>
                  <li>Provide false or misleading information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Permitted Uses</h3>
                <p>You may use our Service to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Create and edit personal resumes</li>
                  <li>Generate professional documents for job applications</li>
                  <li>Store and manage your career information</li>
                  <li>Download and share your completed resumes</li>
                </ul>

                <h3 className="text-xl font-medium">Prohibited Uses</h3>
                <p>You may not use our Service to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Upload or transmit illegal, harmful, or offensive content
                  </li>
                  <li>Impersonate others or provide false information</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Distribute spam, malware, or malicious code</li>
                  <li>Violate intellectual property rights</li>
                  <li>Engage in commercial activities without permission</li>
                  <li>Use automated tools to access the Service</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. User Content and Data
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Your Content</h3>
                <p>
                  You retain ownership of all content you create using our
                  Service, including:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Resume content and personal information</li>
                  <li>Work experience and education details</li>
                  <li>Skills, achievements, and other career data</li>
                </ul>

                <h3 className="text-xl font-medium">License to Use</h3>
                <p>
                  By using our Service, you grant us a limited, non-exclusive
                  license to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Store and process your content to provide the Service</li>
                  <li>Generate PDFs and formatted documents</li>
                  <li>Back up your data for service reliability</li>
                  <li>
                    Analyze usage patterns to improve our Service (in anonymized
                    form)
                  </li>
                </ul>

                <h3 className="text-xl font-medium">Content Standards</h3>
                <p>All content must be:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Accurate and truthful</li>
                  <li>Your own original content or properly licensed</li>
                  <li>Free from illegal or harmful material</li>
                  <li>Respectful and professional</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Intellectual Property Rights
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Our Rights</h3>
                <p>We own all rights to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The Service software and technology</li>
                  <li>Resume templates and designs</li>
                  <li>Logos, trademarks, and branding</li>
                  <li>Website content and documentation</li>
                </ul>

                <h3 className="text-xl font-medium">Your Rights</h3>
                <p>You retain rights to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your personal resume content</li>
                  <li>Documents you create using our Service</li>
                  <li>Your account data and preferences</li>
                </ul>

                <h3 className="text-xl font-medium">Respect for Rights</h3>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Copy, modify, or distribute our proprietary content</li>
                  <li>Use our trademarks without permission</li>
                  <li>Reverse engineer our software</li>
                  <li>Create derivative works based on our Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Privacy and Data Protection
              </h2>
              <div className="space-y-3">
                <p>
                  Your privacy is important to us. Our collection and use of
                  personal information is governed by our Privacy Policy, which
                  is incorporated into these Terms by reference.
                </p>
                <p>Key privacy commitments:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We will not sell your personal information</li>
                  <li>We use industry-standard security measures</li>
                  <li>You can access, modify, or delete your data</li>
                  <li>We will notify you of any data breaches</li>
                </ul>
                <p>
                  Please review our Privacy Policy for detailed information
                  about how we handle your data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Disclaimer of Warranties
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                    AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND.
                  </strong>
                </p>
                <p>We disclaim all warranties, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Merchantability and fitness for a particular purpose</li>
                  <li>Non-infringement of third-party rights</li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>Accuracy or completeness of content</li>
                  <li>Security of data transmission</li>
                </ul>
                <p>
                  You use the Service at your own risk. We do not guarantee that
                  the Service will meet your requirements or be suitable for
                  your specific needs.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Limitation of Liability
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE
                    LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                  </strong>
                </p>
                <p>This includes, but is not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Direct, indirect, incidental, or consequential damages
                  </li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from service interruptions</li>
                  <li>Damages from unauthorized access to your account</li>
                  <li>Damages from errors or omissions in content</li>
                </ul>
                <p>
                  Our total liability to you for all claims shall not exceed the
                  amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                10. Indemnification
              </h2>
              <div className="space-y-3">
                <p>
                  You agree to indemnify and hold us harmless from any claims,
                  damages, or expenses arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any law or third-party rights</li>
                  <li>Content you submit or share through the Service</li>
                  <li>Any false or misleading information you provide</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Termination by You</h3>
                <p>You may terminate your account at any time by:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Deleting your account through your profile settings</li>
                  <li>Contacting our support team</li>
                  <li>Ceasing to use the Service</li>
                </ul>
                <h3 className="text-xl font-medium">Termination by Us</h3>
                <p>Access may be terminated immediately if users:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Breach these Terms of Service</li>
                  <li>Engage in prohibited activities</li>
                  <li>Cause harm to other users or our Service</li>
                  <li>Fail to comply with legal requirements</li>
                </ul>
                <h3 className="text-xl font-medium">Effect of Termination</h3>
                <p>Upon termination:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your right to use the Service ceases immediately</li>
                  <li>Your account and data may be deleted</li>
                  <li>You should download any content you wish to keep</li>
                  <li>
                    Certain provisions of these Terms will survive termination
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                12. Governing Law and Disputes
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Governing Law</h3>
                <p>
                  These Terms are governed by and construed in accordance with
                  the laws of [Your Jurisdiction], without regard to conflict of
                  law principles.
                </p>

                <h3 className="text-xl font-medium">Dispute Resolution</h3>
                <p>
                  Any disputes arising from these Terms or your use of the
                  Service will be resolved through:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Good faith negotiations between the parties</li>
                  <li>Binding arbitration if negotiations fail</li>
                  <li>Courts of [Your Jurisdiction] for injunctive relief</li>
                </ul>

                <h3 className="text-xl font-medium">Class Action Waiver</h3>
                <p>
                  You agree to resolve disputes individually and waive any right
                  to participate in class actions or collective proceedings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                13. Changes to Terms
              </h2>
              <div className="space-y-3">
                <p>
                  These Terms may be modified at any time. Material changes may
                  be communicated by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posting updated Terms on our website</li>
                  <li>Updating the &quot;Last updated&quot; date</li>
                  <li>
                    Email notifications for significant changes (where
                    applicable)
                  </li>
                  <li>Displaying notices within the Service</li>
                </ul>
                <p>
                  Your continued use of the Service after changes become
                  effective constitutes acceptance of the updated Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Severability</h3>
                <p>
                  If any provision of these Terms is found to be invalid or
                  unenforceable, the remaining provisions will continue in full
                  force and effect.
                </p>

                <h3 className="text-xl font-medium">Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy, constitute the
                  entire agreement between you and us regarding the Service.
                </p>

                <h3 className="text-xl font-medium">No Waiver</h3>
                <p>
                  Our failure to enforce any provision of these Terms does not
                  constitute a waiver of that provision or any other provision.
                </p>

                <h3 className="text-xl font-medium">Assignment</h3>
                <p>
                  You may not assign your rights under these Terms. We may
                  Rights and obligations may be assigned without restriction.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                15. Contact Information
              </h2>
              <div className="space-y-3">
                <p>
                  If you have questions about these Terms of Service, please
                  contact us through the support channels available in your
                  account dashboard.
                </p>
                <p>
                  Inquiries are typically responded to within 5 business days.
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                By using our Service, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
