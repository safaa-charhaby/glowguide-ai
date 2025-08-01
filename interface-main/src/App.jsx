import { useState } from 'react';
import { AlertCircle, Check, X, Loader2, ChevronRight, Info, Award, Shield, Star, ShoppingBag } from 'lucide-react';
import './App.css';

export default function App() {
  // Product types state
  const [productTypes] = useState([
    'Cleanser', 'Moisturizer', 'Serum', 'Sunscreen', 
    'Toner', 'Eye Cream', 'Face Mask', 'Exfoliator'
  ]);
  
  const [selectedConcerns] = useState({
    'Acne Fighting': false,
    'Acne Trigger': false,
    'Anti-Aging': false,
    'Brightening': false,
    'Dark Spots': false,
    'Drying': false,
    'Eczema': false,
    'Good For Oily Skin': false,
    'Hydrating': false,
    'Irritating': false,
    'Redness Reducing': false,
    'Reduces Irritation': false,
    'Reduces Large Pores': false,
    'Rosacea': false,
    'Scar Healing': false
  });

 
  const [recommendations, setRecommendations] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  // Step 1: Select product type
  const handleProductTypeSelect = (type) => {
    setSelectedProductType(type);
    setActiveStep(2);
  };

  const handleConcernToggle = (concern) => {
    setSelectedConcerns(prev => ({
      ...prev,
      [concern]: !prev[concern]
    }));
  };
  

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const features = Object.values(selectedConcerns).map(value => value ? 1 : 0);
      
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          features,
          product_type: selectedProductType // Send selected product type to backend
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data.ingredients);
      setActiveStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProductRecommendations = async () => {
    if (!recommendations) return;
    
    setProductsLoading(true);
    setProductsError(null);
    
    try {
      const response = await fetch('http://localhost:5000/filter-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ingredients: recommendations,
          product_type: selectedProductType // Filter by product type
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get product recommendations');
      }
      
      const data = await response.json();
      setRecommendedProducts(data.products || []);
      setActiveStep(4);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProductType(null);
    setSelectedConcerns(Object.keys(selectedConcerns).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {}));
    setRecommendations(null);
    setRecommendedProducts([]);
    setActiveStep(1);
  };

  // Group ingredients by recommendation status
  const groupedIngredients = recommendations ? {
    recommended: Object.entries(recommendations).filter(([_, value]) => value === 'Yes').map(([key]) => key),
    notRecommended: Object.entries(recommendations).filter(([_, value]) => value === 'No').map(([key]) => key)
  } : null;

  // Get count of selected concerns
  const selectedCount = Object.values(selectedConcerns).filter(Boolean).length;


  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-700 to-pink-600 text-white py-8 md:py-16 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 font-serif tracking-tight">GlowGuide AI</h1>
              <p className="text-rose-100 text-lg md:text-xl max-w-xl">Discover your perfect skincare routine with AI-powered analysis</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                <Star className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Progress Steps - New Circular Design */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${activeStep >= step ? 'bg-rose-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                  <span className="font-semibold text-lg">{step}</span>
                  {activeStep > step && (
                    <Check className="absolute -right-1 -top-1 w-5 h-5 bg-green-500 text-white rounded-full p-1" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${activeStep === step ? 'text-rose-700 font-semibold' : 'text-gray-500'}`}>
                  {['Product', 'Concerns', 'Ingredients', 'Products'][step-1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Product Type Selection */}
        {activeStep === 1 && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-rose-100">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-8 py-6 border-b border-rose-100">
              <h2 className="text-2xl font-bold text-gray-800 font-serif">Select Product Category</h2>
              <p className="text-rose-600 text-sm mt-1">What type of skincare product are you looking for?</p>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleProductTypeSelect(type)}
                    className={`p-4 rounded-xl flex flex-col items-center transition-all duration-200 ${
                      selectedProductType === type
                        ? 'bg-rose-600 text-white shadow-md transform scale-105 ring-2 ring-rose-300' 
                        : 'bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      selectedProductType === type ? 'bg-white/20' : 'bg-rose-100'
                    }`}>
                      {getProductIcon(type, selectedProductType === type)}
                    </div>
                    <span className="font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Concerns Selection */}
        {activeStep === 2 && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-rose-100">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-8 py-6 border-b border-rose-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-serif">Your Skin Concerns</h2>
                  <p className="text-rose-600 text-sm mt-1">Select all that apply to your skin</p>
                </div>
                <div className="bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-sm">
                  {selectedCount} Selected
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex items-start mb-6 bg-rose-50 p-4 rounded-xl border border-rose-200">
                <Info className="text-rose-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-rose-800 text-sm">
                  Our AI will analyze your combination to recommend the best {selectedProductType.toLowerCase()} for your needs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(selectedConcerns).map((concern) => (
                  <button
                    key={concern}
                    onClick={() => handleConcernToggle(concern)}
                    className={`p-3 rounded-lg flex items-center gap-3 text-left transition-all duration-150 ${
                      selectedConcerns[concern] 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'bg-white border border-gray-200 hover:border-rose-300 hover:bg-rose-50'
                    }`}
                  >
                    <div className={`w-5 h-5 flex-shrink-0 rounded-md flex items-center justify-center transition-all ${
                      selectedConcerns[concern] ? 'bg-white text-rose-600' : 'border-2 border-gray-300'
                    }`}>
                      {selectedConcerns[concern] && <Check className="w-3 h-3" />}
                    </div>
                    <span>{concern}</span>
                  </button>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedCount === 0}
                  className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md transition-all ${
                    selectedCount > 0
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 hover:shadow-lg transform hover:scale-105' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Your Skin...
                    </>
                  ) : (
                    <>
                      Get Recommendations <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 w-full max-w-md">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">Error</h3>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setActiveStep(1)}
                  className="mt-6 text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1 group"
                >
                  <ChevronRight className="w-4 h-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" /> 
                  Back to product selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Recommendations */}
        {activeStep === 3 && recommendations && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-rose-100">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-8 py-6 border-b border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="text-rose-600 w-6 h-6 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800 font-serif">Your Custom Formula</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveStep(2)} className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1 bg-white border border-rose-200 rounded-lg px-3 py-1.5 shadow-sm hover:bg-rose-50">
                      Back
                    </button>
                    <button onClick={resetForm} className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1 bg-white border border-rose-200 rounded-lg px-3 py-1.5 shadow-sm hover:bg-rose-50">
                      Start Over
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center mb-8 bg-green-50 p-4 rounded-xl border border-green-200">
                  <Check className="text-green-600 w-5 h-5 mr-3 flex-shrink-0" />
                  <p className="text-green-800">
                    <span className="font-semibold">Analysis Complete!</span> Based on your {selectedCount} skin concerns.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recommended Ingredients */}
                  <div className="bg-white border border-green-100 rounded-xl p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <div className="bg-green-100 p-1.5 rounded-full mr-2">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      Recommended Ingredients
                    </h3>
                    
                    {groupedIngredients.recommended.length > 0 ? (
                      <div className="space-y-3">
                        {groupedIngredients.recommended.map((ingredient, index) => (
                          <div key={ingredient} className="bg-green-50/50 border border-green-100 rounded-lg p-3 flex items-start gap-3">
                            <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{formatIngredientName(ingredient)}</span>
                              <p className="text-xs text-gray-500 mt-0.5">{getIngredientDescription(ingredient)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-500 italic">
                        No specifically recommended ingredients
                      </div>
                    )}
                  </div>

                  {/* Not Recommended Ingredients */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <div className="bg-gray-200 p-1.5 rounded-full mr-2">
                        <X className="w-5 h-5 text-gray-600" />
                      </div>
                      Ingredients to Avoid
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedIngredients.notRecommended.slice(0, 8).map(ingredient => (
                        <div key={ingredient} className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="text-gray-700 text-sm">{formatIngredientName(ingredient)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={getProductRecommendations}
                    disabled={productsLoading}
                    className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all ${
                      !productsLoading
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {productsLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Finding Products...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Find Matching Products
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Product Recommendations */}
        {activeStep === 4 && recommendedProducts && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-rose-100">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-8 py-6 border-b border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingBag className="text-rose-600 w-6 h-6 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800 font-serif">Recommended Products</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveStep(3)} className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1 bg-white border border-rose-200 rounded-lg px-3 py-1.5 shadow-sm hover:bg-rose-50">
                      Back
                    </button>
                    <button onClick={resetForm} className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1 bg-white border border-rose-200 rounded-lg px-3 py-1.5 shadow-sm hover:bg-rose-50">
                      Start Over
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center mb-8 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <Info className="text-blue-600 w-5 h-5 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    We found {recommendedProducts.length} products matching your needs.
                  </p>
                </div>

                {recommendedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedProducts.map((product, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <h3 className="font-semibold text-lg text-gray-800 mb-2">
                            {product.name || 'Unnamed Product'}
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">
                            {product.brand || 'Brand'}
                          </p>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Key Ingredients:</p>
                            <div className="flex flex-wrap gap-2">
                              {getProductIngredients(product, groupedIngredients.recommended).slice(0, 5).map(ing => (
                                <span key={ing} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-100">
                                  {formatIngredientName(ing)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-10 text-center">
                    <div className="text-gray-400 mb-3">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <h3 className="text-gray-600 font-semibold text-lg">No Products Found</h3>
                    </div>
                    <button 
                      onClick={() => setActiveStep(3)}
                      className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1 mx-auto bg-white border border-rose-200 rounded-lg px-4 py-2 shadow-sm hover:bg-rose-50 transition-colors"
                    >
                      Back to Ingredients
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} GlowGuide AI. All recommendations are AI-generated and should be verified with a dermatologist.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Updated icon function with new color scheme
function getProductIcon(type, isSelected = false) {
  const color = isSelected ? 'text-white' : 'text-rose-600';
  const icons = {
    'Cleanser': <Shield className={`w-6 h-6 ${color}`} />,
    'Moisturizer': <Star className={`w-6 h-6 ${color}`} />,
    'Serum': <Award className={`w-6 h-6 ${color}`} />,
    'Sunscreen': <Shield className={`w-6 h-6 ${color}`} />,
    'Toner': <Info className={`w-6 h-6 ${color}`} />,
    'Eye Cream': <Star className={`w-6 h-6 ${color}`} />,
    'Face Mask': <ShoppingBag className={`w-6 h-6 ${color}`} />,
    'Exfoliator': <Shield className={`w-6 h-6 ${color}`} />
  };
  return icons[type] || <ShoppingBag className={`w-6 h-6 ${color}`} />;
}

// Helper function to format ingredient names for display
function formatIngredientName(name) {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to provide brief descriptions for ingredients
function getIngredientDescription(ingredient) {
  const descriptions = {
    'hyaluronic': 'Hydrating molecule that holds 1000x its weight in water',
    'niacinamide': 'Vitamin B3 that reduces pores and improves skin texture',
    'peptide': 'Amino acid chains that support collagen production',
    'vitamin_c': 'Potent antioxidant that brightens and protects skin',
    'ceramide': 'Lipids that strengthen the skin barrier and retain moisture',
    'retinol': 'Vitamin A derivative that accelerates cell turnover',
    'aha_bha': 'Exfoliating acids that remove dead skin cells',
    'antioxidant': 'Compounds that protect against environmental damage',
    'mineral_spf': 'Physical UV protection using minerals like zinc oxide',
    'growth_factor': 'Proteins that stimulate cell growth and repair',
    'probiotic': 'Beneficial bacteria that support skin microbiome',
    'hydrating': 'Ingredients that increase skin water content',
    'emollient': 'Softens and smooths skin by filling in gaps',
    'preservative': 'Prevents product contamination and extends shelf life',
    'texture_stabilizer': 'Maintains product consistency and feel',
    'fragrance': 'Adds scent to products but may cause irritation',
    'solvent': 'Dissolves other ingredients in the formulation',
    'ph_adjuster': 'Balances the acidity level of the product',
    'colorant': 'Adds color to the formulation',
    'skin_soothing': 'Calms irritation and reduces redness',
    '2_hexanediol': 'Moisturizer and preservative booster',
    'glyceryl_caprylate': 'Natural preservative with antimicrobial properties',
    'hydroxyacetophenone': 'Antioxidant and preservative enhancer',
    'titanium_dioxide': 'Mineral UV filter that reflects and scatters light'
  };

  return descriptions[ingredient] || 'Supporting ingredient for skin health';
}

// Get product ingredients that match the "Yes" values in recommendations
function getProductIngredients(product, recommendedIngredients) {
  return Object.keys(recommendedIngredients).filter(key => {
    return recommendedIngredients[key] === "Yes" && (product[key] === 1 || product[key] === "Yes");
  });
}