import LandingLayout from "../layouts/landing";
import LandingHomepage from "../modules/Home";
import MarketPlace from "../modules/Home/Marketplace";

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
          path: 'marketplace',
          element: <MarketPlace />,
        },
      ],
    }
  ];