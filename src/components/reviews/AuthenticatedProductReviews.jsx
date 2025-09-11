import React from "react";
import Cookies from "js-cookie";
import { ProductReviews } from "./index";

const AuthenticatedProductReviews = ({ productId, ...props }) => {
  // Check for authentication tokens
  const adminToken = Cookies.get("adminToken");
  const userToken = Cookies.get("token");
  const currentUserUrl = Cookies.get("currUserUrl");

  // If no tokens are present, don't render the reviews component
  if (!adminToken && !userToken) {
    console.log(
      "🚫 ProductReviews: No authentication tokens found, hiding reviews component"
    );
    return null;
  }

  // Check if user has a valid user type
  const validUserTypes = [
    "admin",
    "super-admin",
    "customer",
    "fabric-vendor",
    "fashion-designer",
    "logistics",
    "sales"
  ];

  if (currentUserUrl && !validUserTypes.includes(currentUserUrl)) {
    console.log(
      "🚫 ProductReviews: Invalid user type, hiding reviews component:",
      currentUserUrl
    );
    return null;
  }

  // Render the ProductReviews component only for authenticated users
  return <ProductReviews productId={productId} {...props} />;
};

export default AuthenticatedProductReviews;
