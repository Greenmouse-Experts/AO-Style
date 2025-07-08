import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import useGetUserProfile from "../../modules/Auth/hooks/useGetProfile";
import { useEffect } from "react";
import { useCarybinUserStore } from "../../store/carybinUserStore";

const LandingLayout = () => {
  const { data, isPending, isSuccess, isError, error } = useGetUserProfile();

  const { setCaryBinUser } = useCarybinUserStore();

  useEffect(() => {
    if (data && isSuccess) {
      setCaryBinUser(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <div>
        <Header />
        <Outlet />
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
};

export default LandingLayout;
