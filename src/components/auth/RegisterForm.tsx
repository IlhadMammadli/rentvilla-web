"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useTranslations } from "@/i18n/client";
type CustomerType = "villa_owner" | "realtor";
type Step = "details" | "otp";

export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [step, setStep] = useState<Step>("details");
  const [customerType, setCustomerType] = useState<CustomerType>("villa_owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+994");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  function afterRegister() {
    router.push(redirectTo || "/");
    router.refresh();
  }

  function buildFormData() {
    const formData = new FormData();
    formData.append("customerType", customerType);

    if (customerType === "villa_owner") {
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
    } else {
      formData.append("companyName", companyName);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("password", password);
      if (companyLogo) formData.append("companyLogo", companyLogo);
    }
    return formData;
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDevHint("");

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        body: buildFormData(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.registerFailed"));
        return;
      }

      const verifiedEmail =
        customerType === "villa_owner"
          ? email.trim().toLowerCase()
          : email.trim().toLowerCase();
      setPendingEmail(verifiedEmail);
      if (data.devCode) {
        setDevHint(t("auth.registerDevCode", { code: data.devCode }));
      }
      setStep("otp");
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  async function completeRegistration(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.registerOtpInvalid"));
        return;
      }
      afterRegister();
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={completeRegistration} className="space-y-6">
        <p className="text-sm text-gray-600">{t("auth.registerOtpHint", { email: pendingEmail })}</p>

        <Input
          label={t("auth.verificationCode")}
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          minLength={6}
          maxLength={6}
          placeholder="000000"
        />

        {devHint && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{devHint}</p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? t("auth.registerVerifying") : t("auth.registerComplete")}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setStep("details");
            setOtp("");
            setError("");
          }}
          className="w-full text-sm text-gray-500 hover:text-gray-900"
        >
          {t("auth.registerBackToDetails")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendOtp} className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">{t("auth.customerTypeLabel")}</p>
        <SegmentControl
          options={[
            { value: "villa_owner", label: t("auth.villaOwner") },
            { value: "realtor", label: t("auth.realtor") },
          ]}
          value={customerType}
          onChange={(v) => setCustomerType(v as CustomerType)}
        />
        {customerType === "villa_owner" && (
          <p className="mt-2 text-xs text-gray-500">{t("auth.villaOwnerHint")}</p>
        )}
      </div>

      {customerType === "villa_owner" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("auth.firstName")}
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label={t("auth.lastName")}
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input
            label={t("auth.email")}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PhoneInput label={t("auth.phone")} value={phone} onChange={setPhone} required />
        </>
      ) : (
        <>
          <Input
            label={t("auth.companyName")}
            name="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              {t("auth.companyLogo")}{" "}
              <span className="font-normal text-gray-400">({t("common.optional")})</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCompanyLogo(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-400">{t("auth.logoHint")}</p>
          </div>
          <Input
            label={t("auth.email")}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PhoneInput label={t("auth.mainPhone")} value={phone} onChange={setPhone} required />
        </>
      )}

      <Input
        label={t("auth.password")}
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        placeholder={t("auth.passwordHint")}
      />

      <p className="text-xs text-gray-500">{t("auth.registerOtpNotice")}</p>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? t("auth.registerSendingCode") : t("auth.registerSendCode")}
      </button>
    </form>
  );
}
