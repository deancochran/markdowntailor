import { auth } from "@/auth";

import { CreditClaimSection } from "@/components/settings/CreditClaimSection";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { StripeBillingCredits } from "@/components/settings/StripeBillingCredits";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Payment Status Alerts */}
        {payment === "success" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Payment successful! Your credits have been added to your account.
            </AlertDescription>
          </Alert>
        )}

        {payment === "cancelled" && (
          <Alert className="border">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment was cancelled. You can try again anytime.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={session.user?.image || undefined}
                  alt={session.user?.name || "User"}
                />
                <AvatarFallback className="text-2xl">
                  {session.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">
                  {session.user?.name || "No name set"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Credits Section - Inline Form */}

        <Card>
          <CardHeader>
            <CardTitle>AI Credits</CardTitle>
            <CardDescription>
              Get credits to power your AI-assisted resume building
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Current Balance */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Current Balance</span>
              </div>

              <StripeBillingCredits />

              <p className="text-sm text-muted-foreground">
                Available AI credits
              </p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Free $5.00 Credit Package
                </CardTitle>
                <CardDescription>
                  Perfect for trying out AI resume enhancements and optimization
                  features
                </CardDescription>
              </CardHeader>

              <CreditClaimSection
                initialAlphaCreditsRedeemed={
                  session.user.alpha_credits_redeemed || false
                }
              />
            </Card>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">
                Delete Account
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <DeleteAccountDialog userEmail={session.user?.email || ""} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
