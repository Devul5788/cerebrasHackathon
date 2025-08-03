import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface ProductProfile {
  name: string;
  category: string;
  description: string;
  key_features: string[];
  use_cases: string[];
  current_customers?: string[];
}

interface Message {
  text: string;
  isBot: boolean;
  suggestions?: string[];
}

interface CompanyProfile {
  name: string;
  website: string;
  description: string;
  industry?: string;
  location?: string;
  employees?: number;
  founded?: string;
  found?: boolean;
  logo_url?: string;
  products?: ProductProfile[];
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<ProductProfile[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductProfile[]>([]);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  const handleProductEdit = (index: number, field: keyof ProductProfile, value: string | string[]) => {
    const updatedProducts = [...productSuggestions];
    const product = { ...updatedProducts[index] };

    if (field === 'key_features' || field === 'use_cases') {
      (product[field] as string[]) = (typeof value === 'string' ? value.split('\n') : value).filter(f => f.trim());
    } else {
      (product[field] as string) = value as string;
    }

    updatedProducts[index] = product;
    setProductSuggestions(updatedProducts);

    // Update selected products if this product was selected
    if (selectedProducts.some(p => p.name === product.name)) {
      setSelectedProducts(prev => 
        prev.map(p => p.name === product.name ? product : p)
      );
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (text.toLowerCase() === 'yes' && companyProfile) {
      // Move to product selection after company profile confirmation
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/onboarding/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'product_suggestions',
            company_data: companyProfile
          }),
        });

        const data = await response.json();
        setProductSuggestions(data.product_suggestions || []);
        setShowProductSelection(true);
        setMessages(prev => [...prev, {
          text: data.message,
          isBot: true
        }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          text: "Sorry, I encountered an error. Please try again.",
          isBot: true
        }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (text.toLowerCase() === 'done') {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/onboarding/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'done',
            company_data: {
              ...companyProfile,
              products: selectedProducts
            }
          }),
        });

        const data = await response.json();
        setMessages(prev => [...prev, {
          text: data.message,
          isBot: true
        }]);

        setTimeout(() => {
          window.close();
        }, 3000);
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
      return;
    }

    setMessages(prev => [...prev, { text, isBot: false }]);
    setInput('');
    setLoading(true);

    if (isManualEntry && !companyProfile?.website) {
      setCompanyProfile(prev => ({ ...prev!, website: text }));
      setMessages(prev => [...prev, { 
        text: "Great! Now please provide a brief description of your company:",
        isBot: true 
      }]);
      setLoading(false);
      return;
    }

    if (isManualEntry && !companyProfile?.description) {
      setCompanyProfile(prev => ({ ...prev!, description: text }));
      setMessages(prev => [...prev, { 
        text: "Thanks! I've saved your company profile.",
        isBot: true 
      }]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/onboarding/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, step: 'company_search' }),
      });

      const data = await response.json();
      
      if (text.toLowerCase().includes('manual')) {
        setIsManualEntry(true);
      }

      setMessages(prev => [...prev, {
        text: data.message,
        isBot: true,
        suggestions: data.suggestions
      }]);

      if (data.company_data) {
        setCompanyProfile(data.company_data);
      }

      // New logic to handle product suggestions
      if (data.product_suggestions) {
        setProductSuggestions(data.product_suggestions);
        setShowProductSelection(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMessages([{
      text: "Welcome! I'll help you set up your company profile. What's your company's name?",
      isBot: true
    }]);
  }, []);

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chat section */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.isBot ? '' : 'text-right'}`}>
                <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  msg.isBot ? 'bg-blue-100 text-left' : 'bg-green-100 text-right'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => sendMessage(suggestion)}
                          className="px-3 py-1 text-sm bg-white rounded-full border border-gray-200 hover:bg-gray-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="inline-block p-3 bg-blue-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className="text-sm text-gray-600 ml-2">Searching...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>

        {/* Company Profile section */}
        <div className="bg-white rounded-lg shadow p-4">
          {companyProfile ? (
            <div>
              <div className="flex items-center gap-4 mb-2">
                {companyProfile.logo_url && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img 
                      src={companyProfile.logo_url} 
                      alt={`${companyProfile.name} logo`}
                      className="w-full h-full object-contain"
                      onError={handleLogoError}
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{companyProfile.name}</h2>
                </div>
              </div>
              <div className="mb-4">
                <table className="min-w-full text-sm text-left border border-gray-200 rounded">
                  <tbody>
                    {companyProfile.industry && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600">Industry</td>
                        <td className="py-1 px-2">{companyProfile.industry}</td>
                      </tr>
                    )}
                    {companyProfile.location && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600">Location</td>
                        <td className="py-1 px-2">{companyProfile.location}</td>
                      </tr>
                    )}
                    {companyProfile.employees !== undefined && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600">Employees</td>
                        <td className="py-1 px-2">{companyProfile.employees}</td>
                      </tr>
                    )}
                    {companyProfile.founded && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600">Founded</td>
                        <td className="py-1 px-2">{companyProfile.founded}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {showProductSelection ? (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Products & Services</h3>
                  {loading ? (
                    <LoadingSpinner message="Finding products and services..." />
                  ) : (
                    <>
                      <div className="space-y-4">
                        {productSuggestions.map((product, index) => (
                          <div key={index} className="p-4 border rounded">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                id={`product-${index}`}
                                checked={selectedProducts.some(p => p.name === product.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProducts([...selectedProducts, product]);
                                  } else {
                                    setSelectedProducts(selectedProducts.filter(p => p.name !== product.name));
                                  }
                                }}
                              />
                              <div className="flex-1">
                                {editingProduct === index ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Name:</label>
                                      <input
                                        type="text"
                                        value={product.name}
                                        onChange={e => handleProductEdit(index, 'name', e.target.value)}
                                        className="w-full p-1 text-sm border rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Category:</label>
                                      <input
                                        type="text"
                                        value={product.category}
                                        onChange={e => handleProductEdit(index, 'category', e.target.value)}
                                        className="w-full p-1 text-sm border rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Description:</label>
                                      <textarea
                                        value={product.description}
                                        onChange={e => handleProductEdit(index, 'description', e.target.value)}
                                        className="w-full p-1 text-sm border rounded"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Key Features (one per line):</label>
                                      <textarea
                                        value={product.key_features.join('\n')}
                                        onChange={e => handleProductEdit(index, 'key_features', e.target.value)}
                                        className="w-full p-1 text-sm border rounded"
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Use Cases (one per line):</label>
                                      <textarea
                                        value={product.use_cases.join('\n')}
                                        onChange={e => handleProductEdit(index, 'use_cases', e.target.value)}
                                        className="w-full p-1 text-sm border rounded"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => setEditingProduct(null)}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                      >
                                        Done Editing
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <label htmlFor={`product-${index}`} className="font-semibold">{product.name}</label>
                                      <button
                                        onClick={() => setEditingProduct(index)}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                    <div className="mt-2">
                                      <div className="text-sm font-medium">Key Features:</div>
                                      <ul className="list-disc list-inside text-sm text-gray-600">
                                        {product.key_features.map((feature, i) => (
                                          <li key={i}>{feature}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="mt-2">
                                      <div className="text-sm font-medium">Use Cases:</div>
                                      <ul className="list-disc list-inside text-sm text-gray-600">
                                        {product.use_cases.map((useCase, i) => (
                                          <li key={i}>{useCase}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => sendMessage('done')}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Complete Profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={e => e.preventDefault()}
                >
                  <div>
                    <label className="block font-semibold mb-1" htmlFor="website">Website:</label>
                    <input
                      id="website"
                      type="url"
                      className="w-full p-2 border rounded"
                      value={companyProfile?.website || ''}
                      onChange={e =>
                        setCompanyProfile(profile =>
                          profile ? { ...profile, website: e.target.value } : null
                        )
                      }
                      placeholder="Company website"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1" htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      className="w-full p-2 border rounded"
                      value={companyProfile?.description || ''}
                      onChange={e =>
                        setCompanyProfile(profile =>
                          profile ? { ...profile, description: e.target.value } : null
                        )
                      }
                      placeholder="Brief company description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => sendMessage('yes')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Next: Add Products
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No company profile yet. Please provide your company information in the chat.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
