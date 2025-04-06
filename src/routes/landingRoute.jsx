import LandingLayout from "../layouts/landing";
import LandingHomepage from "../modules/Home";
import MarketPlace from "../modules/Home/Marketplace";
import Product from "../modules/Home/Product";
import Shops from "../modules/Home/Shop";
import ShopDetails from "../modules/Home/ShopDetails";
import AboutUs from "../modules/Home/About";
import ContactUs from "../modules/Home/Contact";
import FAQs from "../modules/Home/Faqs";
import PolicyStatement from "../modules/Home/PolicyStatement";
import PrivacyPolicy from "../modules/Home/PrivacyPolicy";
import TermsandConditions from "../modules/Home/TermsandConditions";
import CookiePolicy from "../modules/Home/CookiePolicy";
import RefundPolicy from "../modules/Home/RefundPolicy";


export const landingRooutes = [
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <LandingHomepage />,
      },
      {
        path: 'about',
        element: <AboutUs />,
      },
      {
        path: 'contact',
        element: <ContactUs />,
      },
      {
        path: 'faqs',
        element: <FAQs />,
      },
      {
        path: 'marketplace',
        element: <MarketPlace />,
      },
      {
        path: 'products',
        element: <Product />,
      },
      {
        path: 'shop',
        element: <Shops />,
      },
      {
        path: 'shop-details',
        element: <ShopDetails />,
      },
      {
        path: 'policy-statement',
        element: <PolicyStatement />
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />
      },
      {
        path: 'terms',
        element: <TermsandConditions />
      },
      {
        path: 'cookie-policy',
        element: <CookiePolicy />
      },
      {
        path: 'refund-policy',
        element: <RefundPolicy />
      },
    ],
  }
];