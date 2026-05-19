"use client";

type Option<T extends string> = { value: T; label: string };

type SegmentControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  name?: string;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentControlProps<T>) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            value === option.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
