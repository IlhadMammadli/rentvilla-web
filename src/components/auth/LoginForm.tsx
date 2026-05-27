"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useTranslations } from "@/i18n/client";
import { defaultPathForRole } from "@/lib/favorites";
import type { UserRole } from "@prisma/client";

type LoginType = "email" | "phone";

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [loginType, setLoginType] = useState<LoginType>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+994");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function afterLogin(role: UserRole) {
    router.push(redirectTo || defaultPathForRole(role));
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginType,
          email: loginType === "email" ? email : undefined,
          phone: loginType === "phone" ? phone : undefined,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.loginFailed"));
        return;
      }

      afterLogin(data.role);
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SegmentControl
        options={[
          { value: "email", label: t("auth.loginTypeEmail") },
          { value: "phone", label: t("auth.loginTypePhone") },
        ]}
        value={loginType}
        onChange={setLoginType}
      />

      {loginType === "email" ? (
        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      ) : (
        <PhoneInput label={t("auth.phone")} value={phone} onChange={setPhone} required />
      )}

      <div>
        <Input
          label={t("auth.password")}
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
          >
            {t("auth.forgotPassword")}
          </Link>
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? t("auth.signingIn") : t("auth.signIn")}
      </button>

      <p className="text-center text-sm text-gray-500">
        {t("auth.noAccount")}{" "}
        <Link
          href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
          className="font-medium text-gray-900 hover:underline"
        >
          {t("nav.register")}
        </Link>
      </p>
    </form>
  );
}
