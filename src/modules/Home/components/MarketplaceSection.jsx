import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import useGetMarketPlaces from "../../../hooks/dashboard/useGetMarketPlaces";
import LoaderComponent from "../../../components/BeatLoader";
import { useMemo } from "react";
import Slider from "react-slick";

export const SamplePrevArrow = (props) => {
  const { onClick, style } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-0 md:-left-2 p-2 bg-white shadow-md rounded-full z-10 top-1/2 -translate-y-1/2"
      style={{ ...style }}
    >
      <ChevronLeft size={24} />
    </button>
  );
};

export const SampleNextArrow = (props) => {
  const { onClick, style } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-0 md:-right-2 p-2 bg-white shadow-md rounded-full z-10 top-1/2 -translate-y-1/2"
      style={{ ...style }}
    >
      <ChevronRight size={24} />
    </button>
  );
};

export const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 5, // Default
  slidesToScroll: 1,
  autoplay: true,
  arrows: true,
  prevArrow: <SamplePrevArrow />,
  nextArrow: <SampleNextArrow />,
  responsive: [
    {
      breakpoint: 1024, // lg
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768, // md
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 480, // sm
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

// const markets = [
//   {
//     id: 1,
//     name: "Onitsha Main Market",
//     location: "Anambra",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
//   },
//   {
//     id: 2,
//     name: "Balogun Market",
//     location: "Lagos",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212981/AoStyle/image5_z4up8a.png",
//   },
//   {
//     id: 3,
//     name: "Kanti Kwari Market",
//     location: "Kano",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212978/AoStyle/image4_uevqus.png",
//   },
//   {
//     id: 4,
//     name: "Onitsha Main Market",
//     location: "Abuja",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212981/AoStyle/image5_z4up8a.png",
//   },
//   {
//     id: 5,
//     name: "Gbagi Market",
//     location: "Oyo",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
//   },
//   {
//     id: 6,
//     name: "Aba Market",
//     location: "Abia",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image_monnw6.png",
//   },
//   {
//     id: 7,
//     name: "Oja Oba Market",
//     location: "Osun",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212970/AoStyle/image5_lqdp3e.png",
//   },
//   {
//     id: 8,
//     name: "Kurmi Market",
//     location: "Kano",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212978/AoStyle/image3_lvscja.png",
//   },
//   {
//     id: 9,
//     name: "Idumota Market",
//     location: "Lagos",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212972/AoStyle/image3_s8h6zh.png",
//   },
//   {
//     id: 10,
//     name: "Ogbete Market",
//     location: "Enugu",
//     image:
//       "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741212971/AoStyle/image4_japi5p.png",
//   },
// ];

export default function MarketplaceSection() {
  const itemsPerPage = 6; // Show 6 items at a time on large screens

  const { data: getMarketPlacePublicData, isPending } = useGetMarketPlaces({
    "pagination[limit]": 10,
  });

  const marketPlacePublic = getMarketPlacePublicData?.data;

  const [index, setIndex] = useState(0);

  const maxIndex = useMemo(
    () => marketPlacePublic?.length - itemsPerPage,
    [marketPlacePublic]
  );

  console.log(maxIndex);

  const nextSlide = () => {
    setIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [index, maxIndex]);

  return (
    <section className="Resizer just px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left sm:pt-0 pt-20 top">
        <button className="border border-purple-500 text-purple-500 px-4 py-2 rounded-full text-sm w-full md:w-auto mb-2 md:mb-0">
          Shop Fabrics
        </button>
        <Link to="/marketplace">
          <button className="bg-gradient text-white px-8 py-3 w-full md:w-auto sm:mt-38 mt-3 cursor-pointer">
            Explore All Markets
          </button>
        </Link>
      </div>

      <h2 className="text-2xl font-medium sm:-mt-14 mt-6">
        Explore Materials by Market Place
      </h2>
      <p className="text-[#4B4A4A] mt-4 max-w-md font-light leading-loose mb-6">
        A virtual marketplace that offers high-quality fabric from various parts
        of the country.
      </p>

      {/* Carousel */}
      {isPending ? (
        <LoaderComponent />
      ) : (
        <div className="relative w-full mt-10 items-center">
          <Slider {...settings}>
            {marketPlacePublic?.map((market) => (
              <Link
                to={`/inner-marketplace`}
                state={{ info: market }}
                key={market.id}
                className="px-2 text-center"
              >
                <img
                  src={market?.multimedia_url}
                  alt={market.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-48 md:h-48 rounded-full object-cover mx-auto"
                />
                <h3
                  className="font-medium mt-6 mb-2 truncate"
                  title={market.name}
                >
                  {market.name}
                </h3>
                <p className="text-[#2B21E5] text-sm flex items-center justify-center font-light">
                  <MapPin size={14} className="mr-1" /> {market.state}
                </p>
              </Link>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
}
