import { auth } from "@/auth";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { PurchaseCreditsForm } from "@/components/settings/PurchaseCreditsForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Decimal from "decimal.js";
import { AlertCircle, CheckCircle } from "lucide-react";
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

        <Card>
          <CardHeader>
            <CardTitle>Purchase Credits</CardTitle>
            <CardDescription>
              Buy credits to power your AI-assisted resume building.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col w-full items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Your Credit Amount:
              </span>{" "}
              <span className="font-semibold text-3xl">
                ${" "}
                {session.user?.credits
                  ? new Decimal(session.user.credits).div(100).toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <PurchaseCreditsForm />
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
