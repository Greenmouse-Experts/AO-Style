import CaryBinApi from "../../CarybinBaseUrl";

const createReview = (payload) => {
  console.log("📤 ReviewService.createReview: Called with payload:", payload);
  console.log(
    "📤 ReviewService.createReview: Product ID being sent:",
    payload.product_id,
  );
  console.log(
    "📤 ReviewService.createReview: Product ID type:",
    typeof payload.product_id,
  );
  console.log(
    "📤 ReviewService.createReview: Product ID length:",
    payload.product_id?.length,
  );
  console.log(
    "📤 ReviewService.createReview: Product ID is valid UUID?",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      payload.product_id,
    ),
  );

  return CaryBinApi.post(`/review/create`, payload);
};

const getProductReviews = (productId, params = {}) => {
  console.log(
    "📤 ReviewService.getProductReviews: Called with productId:",
    productId,
  );
  console.log("📤 ReviewService.getProductReviews: Additional params:", params);
  console.log(
    "📤 ReviewService.getProductReviews: Product ID type:",
    typeof productId,
  );
  console.log(
    "📤 ReviewService.getProductReviews: Product ID is valid UUID?",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    ),
  );

  const queryParams = new URLSearchParams({
    product_id: productId,
    ...params,
  });

  const url = `/review/fetch?${queryParams.toString()}`;
  console.log("📤 ReviewService.getProductReviews: Final URL:", url);

  return CaryBinApi.get(url);
};

const getProductAverageRating = (productId) => {
  console.log(
    "📤 ReviewService.getProductAverageRating: Called with productId:",
    productId,
  );
  console.log(
    "📤 ReviewService.getProductAverageRating: Product ID type:",
    typeof productId,
  );
  console.log(
    "📤 ReviewService.getProductAverageRating: Product ID is valid UUID?",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    ),
  );

  const url = `/review/fetch-avg/${productId}`;
  console.log("📤 ReviewService.getProductAverageRating: Final URL:", url);

  return CaryBinApi.get(url);
};

const ReviewService = {
  createReview,
  getProductReviews,
  getProductAverageRating,
};

export default ReviewService;
