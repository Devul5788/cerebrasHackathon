import React, { useState } from "react";

interface CompanyProfile {
  name: string;
  website: string;
  description: string;
}

const Chatbot: React.FC = () => {
  const [step, setStep] = useState<"ask" | "loading" | "confirm" | "manual">("ask");
  const [companyName, setCompanyName] = useState("");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Call backend API to get company info using Perplexity
  const fetchCompanyProfile = async (name: string) => {
    setStep("loading");
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/company_profile/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: name }),
      });
      if (!response.ok) throw new Error("Could not fetch company profile");
      const data = await response.json();
      if (data.website && data.description) {
        setProfile({ name, website: data.website, description: data.description });
        setStep("confirm");
      } else {
        setStep("manual");
      }
    } catch (err) {
      setError("Failed to fetch company info.");
      setStep("manual");
    }
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement).value;
    const description = (e.currentTarget.elements.namedItem("description") as HTMLInputElement).value;
    setProfile({ name: companyName, website, description });
    setStep("confirm");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Company Profile Setup</h2>
      {step === "ask" && (
        <form
          onSubmit={e => {
            e.preventDefault();
            fetchCompanyProfile(companyName);
          }}
        >
          <label className="block mb-2 font-medium">What is your company name?</label>
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            required
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">
            Next
          </button>
        </form>
      )}
      {step === "loading" && <div>Looking up company info...</div>}
      {step === "confirm" && profile && (
        <div>
          <div className="mb-4">
            <div><b>Name:</b> {profile.name}</div>
            <div><b>Website:</b> {profile.website}</div>
            <div><b>Description:</b> {profile.description}</div>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => alert("Profile saved!")}>
            Confirm & Continue
          </button>
        </div>
      )}
      {step === "manual" && (
        <form onSubmit={handleManualSubmit}>
          <div className="mb-2">Could not autofill. Please enter details:</div>
          <input
            className="border rounded px-3 py-2 w-full mb-2"
            name="website"
            placeholder="Company Website"
            required
          />
          <textarea
            className="border rounded px-3 py-2 w-full mb-2"
            name="description"
            placeholder="Short Description"
            required
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">
            Save Profile
          </button>
        </form>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default Chatbot;