"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useTranslations } from "@/i18n/client";
import type { UserProfile } from "@/lib/profile";

type ProfileFormProps = {
  initialProfile: UserProfile;
};

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const t = useTranslations();

  const [email, setEmail] = useState(initialProfile.email ?? "");
  const [phone, setPhone] = useState(initialProfile.phone ?? "+994");
  const [contactPassword, setContactPassword] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactLoading(true);
    setContactError("");
    setContactSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, currentPassword: contactPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setContactError(mapError(data.error, t));
        return;
      }

      setContactPassword("");
      setContactSuccess(t("profile.contactSaved"));
    } catch {
      setContactError(t("common.errorGeneric"));
    } finally {
      setContactLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError(t("profile.passwordMismatch"));
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordError(mapError(data.error, t));
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(t("profile.passwordSaved"));
    } catch {
      setPasswordError(t("common.errorGeneric"));
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">{t("profile.contactTitle")}</h2>
        <p className="mt-1 text-sm text-gray-500">{t("profile.contactSubtitle")}</p>

        <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
          <Input
            label={t("auth.email")}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <PhoneInput label={t("auth.phone")} value={phone} onChange={setPhone} required />
          <Input
            label={t("profile.currentPassword")}
            name="contactPassword"
            type="password"
            value={contactPassword}
            onChange={(e) => setContactPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {contactError && <p className="text-sm text-red-600">{contactError}</p>}
          {contactSuccess && <p className="text-sm text-green-600">{contactSuccess}</p>}

          <button
            type="submit"
            disabled={contactLoading}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {contactLoading ? t("profile.saving") : t("profile.saveContact")}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">{t("profile.passwordTitle")}</h2>
        <p className="mt-1 text-sm text-gray-500">{t("profile.passwordSubtitle")}</p>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
          <Input
            label={t("profile.currentPassword")}
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label={t("profile.newPassword")}
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label={t("profile.confirmPassword")}
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {passwordLoading ? t("profile.changingPassword") : t("profile.changePassword")}
          </button>
        </form>
      </section>
    </div>
  );
}

function mapError(
  error: string | undefined,
  t: ReturnType<typeof useTranslations>
): string {
  switch (error) {
    case "Current password is incorrect":
      return t("profile.wrongPassword");
    case "Email is already in use":
      return t("profile.emailInUse");
    case "Phone number is already in use":
      return t("profile.phoneInUse");
    case "New password must be different from current password":
      return t("profile.samePassword");
    case "Passwords do not match":
      return t("profile.passwordMismatch");
  }
  return error ?? t("common.errorGeneric");
}
