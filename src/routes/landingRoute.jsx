import LandingLayout from "../layouts/landing";
import LandingHomepage from "../modules/Home";
import MarketPlace from "../modules/Home/marketplace/Marketplace";
import InnerMarket from "../modules/Home/marketplace/InnerMarket";
import Product from "../modules/Home/aostyle/Product";
import AoStyleDetails from "../modules/Home/aostyle/AoStyleDetails";
import Shops from "../modules/Home/shop/Shop";
import ShopDetails from "../modules/Home/shop/ShopDetails";
import PickaStyle from "../modules/Home/shop/PickaStyle";
import AboutUs from "../modules/Home/About";
import ContactUs from "../modules/Home/Contact";
import FAQs from "../modules/Home/Faqs";
import PolicyStatement from "../modules/Home/PolicyStatement";
import PrivacyPolicy from "../modules/Home/PrivacyPolicy";
import TermsandConditions from "../modules/Home/TermsandConditions";
import CookiePolicy from "../modules/Home/CookiePolicy";
import RefundPolicy from "../modules/Home/RefundPolicy";
import Jobs from "../modules/Home/Jobs";
import CartPage from "../modules/Home/CartPage";

export const landingRooutes = [
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <LandingHomepage />,
      },
      {
        path: "about",
        element: <AboutUs />,
      },
      {
        path: "contact",
        element: <ContactUs />,
      },
      {
        path: "faqs",
        element: <FAQs />,
      },
      {
        path: "marketplace",
        element: <MarketPlace />,
      },
      {
        path: "inner-marketplace",
        element: <InnerMarket />,
      },
      {
        path: "products",
        element: <Product />,
      },
      {
        path: "aostyle-details",
        element: <AoStyleDetails />,
      },
      {
        path: "pickastyle",
        element: <PickaStyle />,
      },
      {
        path: "shop",
        element: <Shops />,
      },
      {
        path: "shop-details/:id",
        element: <ShopDetails />,
      },
      {
        path: "policy-statement",
        element: <PolicyStatement />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "terms",
        element: <TermsandConditions />,
      },
      {
        path: "cookie-policy",
        element: <CookiePolicy />,
      },
      {
        path: "refund-policy",
        element: <RefundPolicy />,
      },
      {
        path: "jobs",
        element: <Jobs />,
      },
      {
        path: "view-cart",
        element: <CartPage />,
      },
    ],
  },
];
