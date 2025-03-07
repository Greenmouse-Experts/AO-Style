import LandingLayout from "../layouts/landing";
import LandingHomepage from "../modules/Home";

export const landingRooutes = [
    {
      path: '/',
      element: <LandingLayout />,
      children: [
        {
          index: true,
          element: <LandingHomepage />,
        },
      ],
    }
  ];