import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, MapPin, User, Tag, DollarSign } from "lucide-react";
import MarketplaceService from "../../../services/api/marketplace";
import LoaderComponent from "../../../components/BeatLoader";
import useToast from "../../../hooks/useToast";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toastError } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const color = searchParams.get("color") || "";
  const price = searchParams.get("price") || "";

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = {
          q: query,
          ...(category && { category }),
          ...(color && { color }),
          ...(price && { price }),
        };

        const response = await MarketplaceService.searchProducts(params);
        
        if (response.data?.statusCode === 200) {
          setProducts(response.data.data || []);
          setCount(response.data.count || 0);
        } else {
          setProducts([]);
          setCount(0);
        }
      } catch (error) {
        console.error("Search error:", error);
        toastError("Failed to search products. Please try again.");
        setProducts([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, category, color, price]);

  const handleProductClick = (product) => {
    // Navigate to shop-details page with product ID
    navigate(`/shop-details/${product.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
        {query && (
          <p className="text-gray-600">
            {count > 0 ? (
              <>
                Found <span className="font-semibold">{count}</span> result{count !== 1 ? "s" : ""} for "
                <span className="font-semibold">{query}</span>"
              </>
            ) : (
              <>No results found for "<span className="font-semibold">{query}</span>"</>
            )}
          </p>
        )}
      </div>

      {/* Results Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border border-gray-200"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.fabric?.photos?.[0] || product.style?.photos?.[0] ? (
                  <img
                    src={product.fabric?.photos?.[0] || product.style?.photos?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {product.status && (
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                      product.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.status}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Product Details */}
                <div className="space-y-2 mb-3">
                  {product.category && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>{product.category.name}</span>
                    </div>
                  )}

                  {product.fabric?.market_place && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{product.fabric.market_place.name}</span>
                    </div>
                  )}

                  {product.creator && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{product.creator.name}</span>
                    </div>
                  )}

                  {product.price && (
                    <div className="flex items-center text-sm font-semibold text-purple-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>{formatPrice(product.price)}</span>
                      {product.original_price && product.original_price !== product.price && (
                        <span className="ml-2 text-xs text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* SKU */}
                {product.sku && (
                  <p className="text-xs text-gray-500 mt-2">SKU: {product.sku}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}

