"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "@/i18n/client";

type Step = "email" | "code" | "password" | "done";

export function ForgotPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDevHint("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t("common.errorGeneric"));
      return;
    }

    if (data.devCode) {
      setDevHint(t("auth.resetDevCode", { code: data.devCode }));
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t("auth.resetInvalidCode"));
      return;
    }

    setStep("password");
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("auth.resetPasswordMismatch"));
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t("common.errorGeneric"));
      return;
    }

    setStep("done");
    setTimeout(() => router.push("/login"), 2500);
  }

  if (step === "done") {
    return (
      <div className="rounded-xl bg-green-50 px-4 py-6 text-center text-sm text-green-800">
        <p className="font-medium">{t("auth.resetSuccess")}</p>
        <p className="mt-2">{t("auth.resetRedirectLogin")}</p>
      </div>
    );
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="space-y-6">
        <p className="text-sm text-gray-500">{t("auth.forgotPasswordHint")}</p>
        <Input
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? t("auth.sendingCode") : t("auth.sendCode")}
        </button>
        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-gray-900 hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode} className="space-y-6">
        <p className="text-sm text-gray-500">{t("auth.enterCodeHint", { email })}</p>
        {devHint && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{devHint}</p>
        )}
        <Input
          label={t("auth.verificationCode")}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? t("common.loading") : t("auth.verifyCode")}
        </button>
        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full text-sm text-gray-500 hover:text-gray-900"
        >
          {t("auth.changeEmail")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={setNewPassword} className="space-y-6">
      <p className="text-sm text-gray-500">{t("auth.newPasswordHint")}</p>
      <Input
        label={t("auth.password")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        placeholder={t("auth.passwordHint")}
      />
      <Input
        label={t("auth.confirmPassword")}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength={8}
      />
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? t("auth.resettingPassword") : t("auth.resetPassword")}
      </button>
    </form>
  );
}
