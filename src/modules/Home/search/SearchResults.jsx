import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, MapPin, User, Tag, DollarSign, Gem } from "lucide-react";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, color, price]);

  const handleProductClick = (product) => {
    // Determine the correct fabric ID for navigation
    // The ShopDetails component expects a fabric ID
    // Search API might return different structures, so check multiple possibilities
    let fabricId = null;
    
    // First, check if there's a fabric object with an id
    if (product.fabric?.id) {
      fabricId = product.fabric.id;
    } 
    // If product.id exists and there's no fabric object, it might be the fabric ID directly
    // (similar to how marketplace products work)
    else if (product.id) {
      fabricId = product.id;
    }
    // Check for alternative ID fields
    else if (product.fabric_id) {
      fabricId = product.fabric_id;
    }
    
    if (fabricId) {
      navigate(`/shop-details/${fabricId}`);
    } else {
      console.error("No valid fabric ID found for product:", product);
      toastError("Unable to navigate to product details");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-24">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
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
                {product.fabric?.photos?.[0] || 
                 product.style?.photos?.[0] || 
                 product.photos?.[0] || 
                 product.image ? (
                  <img
                    src={
                      product.fabric?.photos?.[0] || 
                      product.style?.photos?.[0] || 
                      product.photos?.[0] || 
                      product.image
                    }
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {(product.status || product.fabric?.approval_status || product.approval_status) && (
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                      (product.status || product.fabric?.approval_status || product.approval_status) === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.status || product.fabric?.approval_status || product.approval_status}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Product Details */}
                <div className="space-y-2 mb-3">
                  {/* Material Type / Fabric Type */}
                  {(product.fabric?.material_type || product.material_type) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Gem className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="capitalize">
                        {product.fabric?.material_type || product.material_type}
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  {product.category && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{product.category.name}</span>
                    </div>
                  )}

                  {/* Market Place / Location */}
                  {product.fabric?.market_place && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{product.fabric.market_place.name}</span>
                    </div>
                  )}

                  {/* Creator / Seller */}
                  {(product.creator || product.fabric?.creator) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-purple-500" />
                      <span>
                        {product.creator?.name || product.fabric?.creator?.name || "Unknown"}
                      </span>
                    </div>
                  )}

                  {/* Price */}
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

                {/* Tags */}
                {(product.tags || product.product?.tags) && 
                 (product.tags?.length > 0 || product.product?.tags?.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(product.tags || product.product?.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

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

