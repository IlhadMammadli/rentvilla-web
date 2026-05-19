"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";

type City = { id: string; name: string };
type Facility = { id: string; name: string };

type VillaUploadFormProps = {
  cities: City[];
  facilities: Facility[];
  defaultContactName: string;
  defaultContactPhone: string;
};

export function VillaUploadForm({
  cities,
  facilities,
  defaultContactName,
  defaultContactPhone,
}: VillaUploadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [cityId, setCityId] = useState(cities[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [pricePeriod, setPricePeriod] = useState<"DAILY" | "MONTHLY">("DAILY");
  const [guestCount, setGuestCount] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [contactName, setContactName] = useState(defaultContactName);
  const [contactPhone, setContactPhone] = useState(defaultContactPhone);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  function toggleFacility(id: string) {
    setSelectedFacilities((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("cityId", cityId);
    formData.append("price", price);
    formData.append("pricePeriod", pricePeriod);
    formData.append("guestCount", guestCount);
    formData.append("roomCount", roomCount);
    formData.append("contactName", contactName);
    formData.append("contactPhone", contactPhone);
    formData.append("description", description);
    formData.append("address", address);
    selectedFacilities.forEach((id) => formData.append("facilityIds", id));
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/villas", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create villa");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input label="Villa name" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">City</label>
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price"
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Price period</label>
          <select
            value={pricePeriod}
            onChange={(e) => setPricePeriod(e.target.value as "DAILY" | "MONTHLY")}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
          >
            <option value="DAILY">Per day</option>
            <option value="MONTHLY">Per month</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Guest count"
          type="number"
          min="1"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
          required
        />
        <Input
          label="Room count"
          type="number"
          min="1"
          value={roomCount}
          onChange={(e) => setRoomCount(e.target.value)}
          required
        />
      </div>

      <Input label="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
      <PhoneInput label="Contact phone" value={contactPhone} onChange={setContactPhone} required />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Address / location</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, district, or map pin description"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
        />
        <p className="text-xs text-gray-400">
          Google Maps picker will be added in the next step. For now, enter the address manually.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Details</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-900"
          placeholder="Describe the villa, amenities, rules, etc."
        />
      </div>

      {facilities.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Facilities</p>
          <div className="flex flex-wrap gap-2">
            {facilities.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFacility(f.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  selectedFacilities.includes(f.id)
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm"
        />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "Publishing…" : "Publish villa"}
      </button>
    </form>
  );
}
