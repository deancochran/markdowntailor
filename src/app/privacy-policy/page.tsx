import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8" />
              <CardTitle className="text-3xl font-bold">
                Privacy Policy
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>

          <CardContent className="max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium">Personal Information</h3>
                <p>When you use our resume builder service, we may collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (email address, username)</li>
                  <li>
                    Resume content (personal details, work experience,
                    education, skills)
                  </li>
                  <li>Profile information you choose to provide</li>
                  <li>Communication data when you contact us</li>
                </ul>

                <h3 className="text-xl font-medium mt-6">Usage Information</h3>
                <p>
                  We automatically collect certain information about your use of
                  our service:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Device information (IP address, browser type, operating
                    system)
                  </li>
                  <li>
                    Usage patterns (pages visited, features used, time spent)
                  </li>
                  <li>Log data (access times, error logs)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-3">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our resume building service</li>
                  <li>Generate and format your resumes</li>
                  <li>Save and sync your resume data across devices</li>
                  <li>Improve our service and develop new features</li>
                  <li>
                    Respond to your inquiries and provide customer support
                  </li>
                  <li>Send important service updates and notifications</li>
                  <li>Ensure the security and integrity of our platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Information Sharing
              </h2>
              <div className="space-y-4">
                <p>
                  We do not sell, rent, or trade your personal information. We
                  may share your information only in the following
                  circumstances:
                </p>

                <h3 className="text-xl font-medium">Service Providers</h3>
                <p>
                  We may share information with third-party service providers
                  who help us operate our service, such as:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Cloud storage and hosting providers</li>
                  <li>Analytics services</li>
                  <li>Customer support platforms</li>
                  <li>Payment processors (if applicable)</li>
                </ul>

                <h3 className="text-xl font-medium">Legal Requirements</h3>
                <p>We may disclose information if required by law or to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Comply with legal process or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Protect users&apos; rights, property, or safety</li>
                  <li>Investigate fraud or security issues</li>
                </ul>

                <h3 className="text-xl font-medium">Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your
                  information may be transferred as part of that transaction.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <div className="space-y-3">
                <p>
                  We implement appropriate security measures to protect your
                  information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>
                    Limited access to personal information on a need-to-know
                    basis
                  </li>
                  <li>Monitoring for unauthorized access or breaches</li>
                </ul>
                <p className="mt-4">
                  However, no internet transmission is completely secure. While
                  we strive to protect your information, we cannot guarantee
                  absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Your Rights and Choices
              </h2>
              <div className="space-y-4">
                <p>
                  You have the following rights regarding your personal
                  information:
                </p>

                <h3 className="text-xl font-medium">Access and Updates</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information through your account</li>
                  <li>Update or correct your information at any time</li>
                  <li>Download your resume data</li>
                </ul>

                <h3 className="text-xl font-medium">Data Deletion</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Delete individual resumes from your account</li>
                  <li>Request deletion of your entire account and data</li>
                  <li>
                    Data deletion requests are processed according to our
                    retention policies
                  </li>
                </ul>

                <h3 className="text-xl font-medium">
                  Communication Preferences
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Opt out of promotional communications</li>
                  <li>Manage notification settings in your account</li>
                  <li>
                    Note: We may still send service-related communications
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Cookies and Tracking
              </h2>
              <div className="space-y-3">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your account and maintain sessions</li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Provide personalized experiences</li>
                </ul>
                <p>
                  You can control cookies through your browser settings, but
                  disabling cookies may affect service functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <div className="space-y-3">
                <p>We retain your information for as long as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your account remains active</li>
                  <li>Needed to provide our services</li>
                  <li>Required by law or for legitimate business purposes</li>
                  <li>Necessary to resolve disputes or enforce agreements</li>
                </ul>
                <p>
                  When you delete your account, personal information is deleted
                  according to our data retention schedule, except where
                  retention is required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. International Data Transfers
              </h2>
              <div className="space-y-3">
                <p>
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place for international transfers,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Standard contractual clauses</li>
                  <li>Other legally recognized transfer mechanisms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Children&apos;s Privacy
              </h2>
              <div className="space-y-3">
                <p>
                  Our service is not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If we discover we have collected
                  information from a child under 13, we will delete it
                  immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                10. Changes to This Policy
              </h2>
              <div className="space-y-3">
                <p>
                  We may update this Privacy Policy from time to time. Material
                  changes may be communicated by:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Posting the updated policy on our website</li>
                  <li>Updating the &quot;Last updated&quot; date</li>
                  <li>
                    Email notifications for significant changes (where
                    applicable)
                  </li>
                </ul>
                <p>
                  Your continued use of our service after changes become
                  effective constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <div className="space-y-3">
                <p>
                  If you have questions about this Privacy Policy or our data
                  practices, please contact us through the support channels
                  available in your account dashboard.
                </p>
                <p>Inquiries are typically responded to within 30 days.</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
