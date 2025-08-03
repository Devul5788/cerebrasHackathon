import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState<number | null>(null);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<ProductProfile[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductProfile[]>([]);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  const addNewProduct = () => {
    const newProduct: ProductProfile = {
      name: '',
      category: '',
      description: '',
      key_features: [],
      use_cases: [],
      current_customers: []
    };
    setProductSuggestions([...productSuggestions, newProduct]);
    setEditingProduct(productSuggestions.length); // Set to edit mode for the new product
  };

  const removeProduct = (index: number) => {
    const productToRemove = productSuggestions[index];
    setProductSuggestions(productSuggestions.filter((_, i) => i !== index));
    setSelectedProducts(selectedProducts.filter(p => p.name !== productToRemove.name));
    setEditingProduct(null);
  };

  const cleanupProduct = (product: ProductProfile): ProductProfile => {
    return {
      ...product,
      key_features: product.key_features.filter(f => f.trim() !== ''),
      use_cases: product.use_cases.filter(f => f.trim() !== ''),
      current_customers: product.current_customers?.filter(f => f.trim() !== '') || []
    };
  };

  const handleProductEdit = (index: number, field: keyof ProductProfile, value: string | string[]) => {
    const updatedProducts = [...productSuggestions];
    const product = { ...updatedProducts[index] };
    const oldProductName = product.name;

    if (field === 'key_features' || field === 'use_cases') {
      // Handle array fields - split by newlines but preserve empty lines for editing
      // Only filter out empty lines when saving/completing the edit
      if (typeof value === 'string') {
        (product[field] as string[]) = value.split('\n');
      } else {
        (product[field] as string[]) = value;
      }
    } else {
      (product[field] as string) = value as string;
    }

    updatedProducts[index] = product;
    setProductSuggestions(updatedProducts);

    // Update selected products if this product was selected (handle name changes)
    if (selectedProducts.some(p => p.name === oldProductName)) {
      setSelectedProducts(prev => 
        prev.map(p => p.name === oldProductName ? product : p)
      );
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Store the current focus before clearing input
    const shouldRefocus = document.activeElement === inputRef.current;

    if (text.toLowerCase() === 'yes' && companyProfile) {
      // Add user's "Yes" message first
      setMessages(prev => [...prev, { text, isBot: false }]);
      
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
        
        // Add bot response with typing effect
        const newMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, {
          text: "",
          isBot: true
        }]);
        setCurrentTypingIndex(newMessageIndex);
        
        let index = 0;
        const timer = setInterval(() => {
          if (index < data.message.length) {
            setMessages(prev => prev.map((msg, i) => 
              i === newMessageIndex 
                ? { ...msg, text: data.message.substring(0, index + 1) }
                : msg
            ));
            index++;
          } else {
            clearInterval(timer);
            setCurrentTypingIndex(null);
          }
        }, 30);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
          text: "Sorry, I encountered an error. Please try again.",
          isBot: true
        }]);
      } finally {
        setLoading(false);
        // Refocus input after operation completes
        if (shouldRefocus) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
      return;
    }

    if (text.toLowerCase() === 'done') {
      // Add user's "done" message first
      setMessages(prev => [...prev, { text, isBot: false }]);
      
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/onboarding/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: 'done',
            company_data: {
              ...companyProfile,
              products: selectedProducts.map(cleanupProduct)
            }
          }),
        });

        const data = await response.json();
        
        // Add bot response with typing effect
        const newMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, {
          text: "",
          isBot: true
        }]);
        setCurrentTypingIndex(newMessageIndex);
        
        let index = 0;
        const timer = setInterval(() => {
          if (index < data.message.length) {
            setMessages(prev => prev.map((msg, i) => 
              i === newMessageIndex 
                ? { ...msg, text: data.message.substring(0, index + 1) }
                : msg
            ));
            index++;
          } else {
            clearInterval(timer);
            setCurrentTypingIndex(null);
          }
        }, 30);

        setTimeout(() => {
          window.close();
        }, 3000);
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
      return;
    }

    setInput('');
    setLoading(true);

    if (isManualEntry && !companyProfile?.website) {
      setCompanyProfile(prev => ({ ...prev!, website: text }));
      setMessages(prev => [...prev, { 
        text: "Great! Now please provide a brief description of your company:",
        isBot: true 
      }]);
      setLoading(false);
      // Refocus input
      if (shouldRefocus) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return;
    }

    if (isManualEntry && !companyProfile?.description) {
      setCompanyProfile(prev => ({ ...prev!, description: text }));
      setMessages(prev => [...prev, { 
        text: "Thanks! I've saved your company profile.",
        isBot: true 
      }]);
      setLoading(false);
      // Refocus input
      if (shouldRefocus) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      return;
    }

    // Add user message first
    const newUserMessage = { text, isBot: false };
    setMessages(prev => [...prev, newUserMessage]);
    
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

      // Add bot message with typing effect
      const newMessageIndex = messages.length + 1; // +1 because we just added the user message
      setMessages(prev => [...prev, {
        text: "",
        isBot: true,
        suggestions: data.suggestions
      }]);
      setCurrentTypingIndex(newMessageIndex);

      let index = 0;
      const timer = setInterval(() => {
        if (index < data.message.length) {
          setMessages(prev => prev.map((msg, i) => 
            i === newMessageIndex 
              ? { ...msg, text: data.message.substring(0, index + 1) }
              : msg
          ));
          index++;
        } else {
          clearInterval(timer);
          setCurrentTypingIndex(null);
        }
      }, 30);

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
      // Refocus input after operation completes
      if (shouldRefocus) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus management - keep input focused unless editing a product
  useEffect(() => {
    if (editingProduct === null && !loading) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editingProduct, loading, messages]);

  // Handle keyboard shortcuts for editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to cancel editing
      if (e.key === 'Escape' && editingProduct !== null) {
        setEditingProduct(null);
        return;
      }
      // Ctrl/Cmd + Enter to save and continue
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && editingProduct !== null) {
        e.preventDefault();
        const product = productSuggestions[editingProduct];
        const cleanProduct = cleanupProduct(product);
        
        // Update the product in suggestions with cleaned version
        const updatedProducts = [...productSuggestions];
        updatedProducts[editingProduct] = cleanProduct;
        setProductSuggestions(updatedProducts);
        
        if (cleanProduct.name && !selectedProducts.some(p => p.name === cleanProduct.name)) {
          setSelectedProducts([...selectedProducts, cleanProduct]);
        }
        setEditingProduct(null);
        return;
      }

      // Auto-focus input when typing (unless we're editing a product or in a form field)
      if (editingProduct === null && !loading) {
        const activeElement = document.activeElement;
        const isInInput = activeElement === inputRef.current;
        const isInFormField = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        
        // Only refocus if we're not already in the input and not in another form field
        if (!isInInput && !isInFormField && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingProduct, productSuggestions, selectedProducts, loading]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = "Welcome! I'll help you set up your company profile. What's your company's name?";
    setMessages([{
      text: "",
      isBot: true
    }]);
    setCurrentTypingIndex(0);

    let index = 0;
    const timer = setInterval(() => {
      if (index < welcomeMessage.length) {
        setMessages(prev => [{
          text: welcomeMessage.substring(0, index + 1),
          isBot: true
        }]);
        index++;
      } else {
        clearInterval(timer);
        setCurrentTypingIndex(null);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Chat section */}
        <div className="md:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.isBot ? '' : 'text-right'}`}>
                <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  msg.isBot ? 'bg-blue-100 dark:bg-blue-900 text-left' : 'bg-green-100 dark:bg-green-900 text-right'
                }`}>
                  <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">
                    {msg.text}
                    {currentTypingIndex === index && <span className="animate-pulse text-gray-900 dark:text-gray-100">|</span>}
                  </p>
                  {msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            sendMessage(suggestion);
                            // Refocus input after clicking suggestion
                            setTimeout(() => inputRef.current?.focus(), 150);
                          }}
                          className="px-3 py-1 text-sm bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
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
                <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">Searching...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        <div className="md:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          {companyProfile ? (
            <div>
              <div className="flex items-center gap-4 mb-2">
                {companyProfile.logo_url && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <img 
                      src={companyProfile.logo_url} 
                      alt={`${companyProfile.name} logo`}
                      className="w-full h-full object-contain"
                      onError={handleLogoError}
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{companyProfile.name}</h2>
                </div>
              </div>
              <div className="mb-4">
                <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-600 rounded">
                  <tbody>
                    {companyProfile.industry && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600 dark:text-gray-300">Industry</td>
                        <td className="py-1 px-2 text-gray-900 dark:text-gray-100">{companyProfile.industry}</td>
                      </tr>
                    )}
                    {companyProfile.location && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600 dark:text-gray-300">Location</td>
                        <td className="py-1 px-2 text-gray-900 dark:text-gray-100">{companyProfile.location}</td>
                      </tr>
                    )}
                    {companyProfile.employees !== undefined && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600 dark:text-gray-300">Employees</td>
                        <td className="py-1 px-2 text-gray-900 dark:text-gray-100">{companyProfile.employees}</td>
                      </tr>
                    )}
                    {companyProfile.founded && (
                      <tr>
                        <td className="py-1 px-2 font-semibold text-gray-600 dark:text-gray-300">Founded</td>
                        <td className="py-1 px-2 text-gray-900 dark:text-gray-100">{companyProfile.founded}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {showProductSelection ? (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Products & Services</h3>
                  {loading ? (
                    <LoadingSpinner message="Finding products and services..." />
                  ) : (
                    <>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {productSuggestions.map((product, index) => {
                          const isSelected = selectedProducts.some(p => p.name === product.name);
                          return (
                            <div 
                              key={index} 
                              className={`p-4 border rounded transition-all ${
                                isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              } ${editingProduct === index ? 'ring-2 ring-blue-300' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                {editingProduct === index ? (
                                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                      💡 Tip: Press Ctrl+Enter to save quickly, or Escape to cancel
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name:</label>
                                      <input
                                        type="text"
                                        value={product.name}
                                        onChange={e => handleProductEdit(index, 'name', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="Enter product name"
                                        autoFocus={product.name === ''}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category:</label>
                                      <input
                                        type="text"
                                        value={product.category}
                                        onChange={e => handleProductEdit(index, 'category', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="Enter category"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description:</label>
                                      <textarea
                                        value={product.description}
                                        onChange={e => handleProductEdit(index, 'description', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        rows={2}
                                        placeholder="Enter product description"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Key Features (one per line):</label>
                                      <textarea
                                        value={product.key_features.join('\n')}
                                        onChange={e => handleProductEdit(index, 'key_features', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        rows={4}
                                        placeholder="Enter each feature on a new line&#10;Feature 1&#10;Feature 2&#10;Feature 3"
                                        onKeyDown={(e) => {
                                          // Allow Enter key to create new lines
                                          if (e.key === 'Enter') {
                                            e.stopPropagation();
                                          }
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Use Cases (one per line):</label>
                                      <textarea
                                        value={product.use_cases.join('\n')}
                                        onChange={e => handleProductEdit(index, 'use_cases', e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        rows={4}
                                        placeholder="Enter each use case on a new line&#10;Use case 1&#10;Use case 2&#10;Use case 3"
                                        onKeyDown={(e) => {
                                          // Allow Enter key to create new lines
                                          if (e.key === 'Enter') {
                                            e.stopPropagation();
                                          }
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeProduct(index);
                                        }}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                      >
                                        Delete Product
                                      </button>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProduct(null);
                                          }}
                                          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Clean up the product before saving/selecting
                                            const cleanProduct = cleanupProduct(product);
                                            
                                            // Update the product in suggestions with cleaned version
                                            const updatedProducts = [...productSuggestions];
                                            updatedProducts[index] = cleanProduct;
                                            setProductSuggestions(updatedProducts);
                                            
                                            // Auto-select the product if it has a name and isn't already selected
                                            if (cleanProduct.name.trim() && !isSelected) {
                                              setSelectedProducts(prev => {
                                                // Remove any existing version with old name first
                                                const filtered = prev.filter(p => p.name !== product.name);
                                                return [...filtered, cleanProduct];
                                              });
                                            } else if (isSelected) {
                                              // Update the selected product with cleaned version
                                              setSelectedProducts(prev =>
                                                prev.map(p => p.name === product.name ? cleanProduct : p)
                                              );
                                            }
                                            setEditingProduct(null);
                                          }}
                                          disabled={!product.name.trim()}
                                          className={`px-3 py-1 text-sm rounded transition-colors ${
                                            product.name.trim() 
                                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                          }`}
                                          title={!product.name.trim() ? 'Product name is required' : ''}
                                        >
                                          Save & {isSelected ? 'Keep Selected' : 'Select'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedProducts(selectedProducts.filter(p => p.name !== product.name));
                                      } else {
                                        setSelectedProducts([...selectedProducts, product]);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold text-lg">{product.name || 'Unnamed Product'}</h4>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingProduct(index);
                                          }}
                                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeProduct(index);
                                          }}
                                          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                    {product.category && (
                                      <div className="mb-2">
                                        <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                                          {product.category}
                                        </span>
                                      </div>
                                    )}
                                    {product.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{product.description}</p>
                                    )}
                                    {product.key_features && product.key_features.length > 0 && (
                                      <div className="mb-3">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Features:</div>
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                          {product.key_features.map((feature, i) => (
                                            <li key={i}>{feature}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {product.use_cases && product.use_cases.length > 0 && (
                                      <div className="mb-2">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Use Cases:</div>
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                          {product.use_cases.map((useCase, i) => (
                                            <li key={i}>{useCase}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Checkmark indicator - only show when not editing */}
                              {editingProduct !== index && (
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                      
                      {/* Control buttons */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                        <button
                          onClick={addNewProduct}
                          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2 transition-colors"
                        >
                          <span className="text-lg">+</span>
                          Add New Product
                        </button>
                        
                        {selectedProducts.length > 0 && (
                          <div className="flex gap-2">
                            <div className="flex-1 text-sm text-gray-600 dark:text-gray-300 py-2">
                              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                            </div>
                            <button
                              onClick={() => {
                                sendMessage('done');
                                // Refocus input after clicking done
                                setTimeout(() => inputRef.current?.focus(), 150);
                              }}
                              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Done with Products
                            </button>
                          </div>
                        )}
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
                    <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300" htmlFor="website">Website:</label>
                    <input
                      id="website"
                      type="url"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                    <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300" htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                </form>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No company profile yet. Please provide your company information in the chat.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
