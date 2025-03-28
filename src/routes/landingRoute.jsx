import LandingLayout from "../layouts/landing";
import LandingHomepage from "../modules/Home";
import MarketPlace from "../modules/Home/Marketplace";
import Product from "../modules/Home/Product";
import Shops from "../modules/Home/Shop";
import ShopDetails from "../modules/Home/ShopDetails";
import AboutUs from "../modules/Home/About";
import ContactUs from "../modules/Home/Contact";
import FAQs from "../modules/Home/Faqs";

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
    ],
  }
];