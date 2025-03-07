import BannerSlider from "./components/BannerSlider";
import MarketplaceSection from "./components/MarketplaceSection";
import ProductGrid from "./components/ProductGrid";
import HeroSection from "./components/HeroSection";
import ProductSection from "./components/ProductSection";
import TailoringServices from "./components/TailoringServices";
import TestimonialSlider from "./components/TestimonialSlider";
import FaqSection from "./components/FaqSection";
import ShippingInfo from "./components/ShippingInfo";

export default function NewHome() {
    return (
        <>
            <BannerSlider />
            <MarketplaceSection />
            <ProductGrid />
            <HeroSection />
            <ProductSection />
            <TailoringServices />
            <TestimonialSlider />
            < FaqSection/>
            <ShippingInfo />
        </>
    );
}