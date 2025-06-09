import { auth } from "@/auth";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
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

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Export Your Data (Coming Soon)
              </h4>
              <p className="text-sm text-muted-foreground">
                Download all your resumes and account data
              </p>
            </div>

            <Separator />

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

        {/* Preferences */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Theme preferences are available in the theme toggle in the
              navigation bar.
            </p>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
