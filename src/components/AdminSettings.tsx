import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";

const AdminSettings = () => {
  const { user } = useAdmin();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailForm, setEmailForm] = useState({
    newEmail: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(emailForm.newEmail)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    if (emailForm.newEmail === user?.email) {
      setErrors(prev => ({ ...prev, email: "New email must be different from current email" }));
      return;
    }

    setErrors(prev => ({ ...prev, email: "" }));
    setIsUpdatingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      });

      if (error) throw error;

      toast.success("Email update request sent! Please check your new email to confirm the change.");
    } catch (error: any) {
      console.error("Error updating email:", error);
      setErrors(prev => ({ 
        ...prev, 
        email: error.message || "Failed to update email. Please try again." 
      }));
      toast.error("Failed to update email. Please try again.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(passwordForm.newPassword)) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters long" }));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors(prev => ({ ...prev, password: "New passwords do not match" }));
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setErrors(prev => ({ ...prev, password: "New password must be different from current password" }));
      return;
    }

    setErrors(prev => ({ ...prev, password: "" }));
    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      setErrors(prev => ({ 
        ...prev, 
        password: error.message || "Failed to update password. Please try again." 
      }));
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Current Email</Label>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Account ID</Label>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{user?.id}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Last Sign In</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.last_sign_in_at ? 
                new Date(user.last_sign_in_at).toLocaleString() : 
                "N/A"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Update Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div>
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter new email address"
                className="mt-1"
              />
            </div>

            {errors.email && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You will receive a confirmation email at your new address. Your email will only be updated after you confirm the change.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              disabled={isUpdatingEmail || emailForm.newEmail === user?.email}
              className="w-full"
            >
              {isUpdatingEmail ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Update Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {errors.password && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.password}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password must be at least 6 characters long. You will remain signed in after changing your password.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              disabled={isUpdatingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="w-full"
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;