import CaryBinApi from "../../CarybinBaseUrl";

const getAllProducts = (params) => {
  return CaryBinApi.get(`/product-category?${params.type}`, {
    params,
  });
};

const createProduct = (payload) => {
  return CaryBinApi.post(`/product-category/create`, payload);
};

const editProduct = (payload) => {
  return CaryBinApi.patch(`/product-category/${payload.id}`, payload);
};

const ProductService = {
  getAllProducts,
  createProduct,
  editProduct,
};

export default ProductService;
