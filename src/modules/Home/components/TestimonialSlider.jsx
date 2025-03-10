import { useEffect, useRef } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    name: "Victor Promise",
    role: "Customer",
    text: "I'm so happy I found this platform.\n\nI got exactly what I wanted stress-free.\n\nI just ordered a Kaftan, and it got delivered faster than I thought!",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Hamzat Abdul",
    role: "Vendor",
    text: "With this app, I was able to measure my body size.\n\nI ordered premium fabric from a trusted vendor.\n\nAnd I hired a tailor—all in one place!",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Victor Promise",
    role: "Vendor",
    text: "With this app, I was able to measure my body size.\n\nI ordered premium fabric from a trusted vendor.\n\nAnd I hired a tailor—all in one place!",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Hamzat Adeleke",
    role: "Vendor",
    text: "With this app, I was able to measure my body size.\n\nI ordered premium fabric from a trusted vendor.\n\nAnd I hired a tailor—all in one place!",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
];

export default function TestimonialCarousel() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    let scrollAmount = 0;

    const scrollInterval = setInterval(() => {
      if (scroll) {
        scrollAmount += 1;
        scroll.scrollLeft = scrollAmount;
        if (scrollAmount >= scroll.scrollWidth / 2) {
          scrollAmount = 0;
        }
      }
    }, 50);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="overflow-hidden bg-white section">
        <h2 className="text-2xl font-medium mx-auto text-center max-w-lg leading-relaxed px-4">Your convenience and satisfaction is our top priority</h2>
      <div ref={scrollRef} className="flex space-x-6 overflow-x-auto scrollbar-hide mt-14 px-6">
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div key={index} className="flex-shrink-0 w-auto bg-white shadow-sm p-6 rounded-lg">
            <div className="flex gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-5 w-5" />
              ))}
            </div>
            <p className="text-gray-600 mt-5 whitespace-pre-line">{testimonial.text}</p>
            <div className="flex items-center mt-8 mb-4">
              <img src={testimonial.image} alt={testimonial.name} className="h-10 w-10 rounded-full" />
              <div className="ml-3">
                <p className="text-gray-800 font-semibold">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
