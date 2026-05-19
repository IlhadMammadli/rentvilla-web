"use client";

type PhoneInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
};

export function PhoneInput({
  label,
  value,
  onChange,
  error,
  required,
}: PhoneInputProps) {
  const localNumber = value.replace(/^\+994/, "").replace(/\D/g, "");

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <div className="flex shrink-0 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
          +994
        </div>
        <input
          type="tel"
          required={required}
          value={localNumber}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
            onChange(digits ? `+994${digits}` : "+994");
          }}
          placeholder="50 123 45 67"
          className={`min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 ${
            error ? "border-red-400" : ""
          }`}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
