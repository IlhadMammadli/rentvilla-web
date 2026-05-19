"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";

type CustomerType = "villa_owner" | "realtor";

export function RegisterForm() {
  const router = useRouter();
  const [customerType, setCustomerType] = useState<CustomerType>("villa_owner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+994");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
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

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">I am a</p>
        <SegmentControl
          options={[
            { value: "villa_owner", label: "Villa owner" },
            { value: "realtor", label: "Realtor" },
          ]}
          value={customerType}
          onChange={setCustomerType}
        />
      </div>

      {customerType === "villa_owner" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Surname"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PhoneInput label="Phone number" value={phone} onChange={setPhone} required />
        </>
      ) : (
        <>
          <Input
            label="Company name"
            name="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Company logo <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCompanyLogo(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-400">
              If not uploaded, the default RentVilla logo will be used.
            </p>
          </div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PhoneInput label="Main phone number" value={phone} onChange={setPhone} required />
        </>
      )}

      <Input
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        placeholder="At least 8 characters"
      />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
