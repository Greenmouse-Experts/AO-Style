import { useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import useGetPublicFAQs from '../../../hooks/faq/useGetPublicFAQs';
import BeatLoader from '../../../components/BeatLoader';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  
  // Fetch FAQs from API - limiting to first 6 for home page
  const { data: faqsData, isLoading, error } = useGetPublicFAQs(1, 6);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Get active FAQs from the API response
  const faqs = faqsData?.data?.filter(faq => faq.is_active) || [];

  return (
    <div className="just Resizer">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center text-left mb-6 px-4">
        <button className="border border-[#EE79AC] text-[#484545] px-4 py-2 rounded-full text-sm w-full md:w-auto mb-2 md:mb-0">
          FAQs
        </button>
        <Link to="/faqs">
          <button className="bg-gradient text-white px-8 py-3 w-full md:w-auto cursor-pointer">
            See ALL FAQs
          </button>
        </Link>
      </div>

      <h2 className="text-2xl font-medium max-w-md loose-relaxed px-4">Here are some of our Frequently Asked Questions</h2>
      
      <div className="bg-cover bg-center p-6 rounded-lg mt-10" style={{ backgroundImage: "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1741337440/AoStyle/image_1_1_p3p60c.jpg')" }}>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <BeatLoader />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load FAQs</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No FAQs available at the moment.</p>
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div key={faq.id || index} className="mb-4 mt-6 bg-white shadow-md max-w-5xl mx-auto rounded-lg overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-base text-gray-900">Q{index + 1}: {faq.question}</span>
                {openIndex === index ? (
                  <MinusIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <PlusIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-6 text-base border-t text-gray-700">{faq.answer}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
