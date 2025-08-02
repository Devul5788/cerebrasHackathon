import React, { useState } from "react";

interface Product {
  name: string;
  short_description: string;
}

interface CompanyProfile {
  company_name: string;
  website: string;
  description: string;
  products: Product[];
}

interface ProductProfile {
  name: string;
  description: string;
  features: string[];
  target_customers: string;
}

const Chatbot: React.FC = () => {
  const [step, setStep] = useState<"ask" | "loading" | "confirm" | "select_products" | "product_profile" | "manual">("ask");
  const [companyName, setCompanyName] = useState("");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sellingProduct, setSellingProduct] = useState("");
  const [productProfile, setProductProfile] = useState<ProductProfile | null>(null);

  // Call backend API to get company info and products
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
      if (data.website && data.description && Array.isArray(data.products)) {
        setProfile(data);
        setStep("select_products");
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
    setProfile({
      company_name: companyName,
      website,
      description,
      products: [],
    });
    setStep("select_products");
  };

  const handleProductSelection = (productName: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName]
    );
  };

  const handleProductProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("loading");
    // For demo, just mock the product profile
    setTimeout(() => {
      setProductProfile({
        name: sellingProduct,
        description: "A cutting-edge solution designed to solve key customer pain points.",
        features: [
          "Feature 1: Innovative technology",
          "Feature 2: User-friendly interface",
          "Feature 3: Scalable and secure",
        ],
        target_customers: "Businesses looking for modern solutions",
      });
      setStep("product_profile");
    }, 1200);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-semibold">AI Chatbot</span>
        Company Profile Setup
      </h2>
      {/* Step 1: Ask for company name */}
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
            placeholder="e.g. OpenAI"
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition" type="submit">
            Next
          </button>
        </form>
      )}

      {/* Step 2: Loading */}
      {step === "loading" && (
        <div className="flex items-center gap-2">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></span>
          <span>Looking up company info...</span>
        </div>
      )}

      {/* Step 3: Manual entry fallback */}
      {step === "manual" && (
        <form onSubmit={handleManualSubmit}>
          <div className="mb-2 text-red-500">Could not autofill. Please enter details:</div>
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

      {/* Step 4: Show company info and product selection */}
      {step === "select_products" && profile && (
        <div>
          <div className="mb-4">
            <div><b>Name:</b> {profile.company_name}</div>
            <div><b>Website:</b> <a href={profile.website} className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">{profile.website}</a></div>
            <div><b>Description:</b> {profile.description}</div>
          </div>
          <div className="mb-4">
            <div className="font-medium mb-2">Which of these products does your company offer?</div>
            <form
              onSubmit={e => {
                e.preventDefault();
                setStep("confirm");
              }}
            >
              <div className="grid gap-2">
                {profile.products.length === 0 && (
                  <div className="text-gray-500">No products found. You can add them later.</div>
                )}
                {profile.products.map((product, idx) => (
                  <label key={idx} className="flex items-center gap-2 bg-indigo-50 rounded px-3 py-2 hover:bg-indigo-100 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.name)}
                      onChange={() => handleProductSelection(product.name)}
                      className="accent-indigo-600"
                    />
                    <span>
                      <b>{product.name}</b>
                      <span className="ml-2 text-sm text-gray-600">{product.short_description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                type="submit"
                disabled={profile.products.length > 0 && selectedProducts.length === 0}
              >
                Next
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 5: Ask what product they want to sell */}
      {step === "confirm" && (
        <form
          onSubmit={handleProductProfile}
        >
          <div className="mb-2 font-medium">Which product are you trying to sell?</div>
          <input
            className="border rounded px-3 py-2 w-full mb-4"
            value={sellingProduct}
            onChange={e => setSellingProduct(e.target.value)}
            required
            placeholder="Enter product name"
            list="product-options"
          />
          <datalist id="product-options">
            {selectedProducts.map((prod, idx) => (
              <option key={idx} value={prod} />
            ))}
          </datalist>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" type="submit">
            Generate Product Profile
          </button>
        </form>
      )}

      {/* Step 6: Show generated product profile */}
      {step === "product_profile" && productProfile && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="text-lg font-semibold mb-2">Product Profile</div>
          <div><b>Name:</b> {productProfile.name}</div>
          <div><b>Description:</b> {productProfile.description}</div>
          <div><b>Features:</b>
            <ul className="list-disc ml-6">
              {productProfile.features.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          </div>
          <div><b>Target Customers:</b> {productProfile.target_customers}</div>
          <button
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            onClick={() => alert("Profile saved!")}
          >
            Confirm & Continue
          </button>
        </div>
      )}

      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default Chatbot;