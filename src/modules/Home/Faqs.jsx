import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import Breadcrumb from "./components/Breadcrumb";
import ShippingInfo from "./components/ShippingInfo";
import useGetPublicFAQs from '../../hooks/faq/useGetPublicFAQs';
import BeatLoader from '../../components/BeatLoader';

// FAQ data - commented out dummy data
// const faqs = [
//   { question: "What size am I?", answer: "Please refer to our size guide on the website to find your perfect fit." },
//   { question: "Do you have a retail store?", answer: "Yes, we have multiple retail stores across the country." },
//   { question: "Are your online stores open?", answer: "Yes, our online store is open 24/7 for your convenience." },
//   { question: "What is your return/exchange policy?", answer: "We accept returns within 30 days of purchase. Items must be unworn and in original packaging." },
//   { question: "How do I start an exchange/return?", answer: "To start an exchange or return, please visit our returns portal on our website and follow the instructions." },
//   { question: "Do you ship internationally?", answer: "Yes, we offer international shipping to many countries worldwide." },
//   { question: "How can I track my order?", answer: "Once your order is shipped, you will receive a tracking number via email." },
//   { question: "Can I return a purchase I made online in-store?", answer: "Yes, you can return online purchases in-store with the original receipt." },
//   { question: "What are your privacy policies/terms and conditions?", answer: "You can read our privacy policies and terms & conditions on our website." }
// ];

// Main FAQ component
export default function FAQsSectionPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const { data: faqsData, isLoading, error } = useGetPublicFAQs();

  const toggleFAQ = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Get active FAQs from the API response
  // The API returns: { statusCode: 200, data: [...], count: 1 }
  // The hook returns the full API response, so we access data.data for the FAQs array
  const faqs = faqsData?.data?.filter(faq => faq.is_active) || [];
  
  console.log("🔍 FAQ Data in component:", faqsData);
  console.log("🔍 Filtered FAQs:", faqs);

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        title="FAQs"
        subtitle="Frequently Asked Questions"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
      />

      {/* FAQ Section */}
      <div className="Resizer section px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products and services
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <BeatLoader />
                <p className="mt-4 text-gray-500">Loading FAQs...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium text-lg">Failed to load FAQs</p>
                <p className="text-red-500 text-sm mt-2">Please check your connection and try again</p>
              </div>
            </div>
          )}

          {!isLoading && !error && faqs.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">No FAQs Available</p>
                <p className="text-gray-500 text-sm mt-2">We're working on adding helpful questions and answers</p>
              </div>
            </div>
          )}

        {!isLoading && !error && faqs.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={`faq-${faq.id || index}`}
                  className={`border rounded-xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    openIndex === index 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-400 shadow-md' 
                      : 'border-gray-200 hover:border-purple-300 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h4 className={`text-lg font-semibold leading-relaxed ${
                        openIndex === index ? 'text-purple-900' : 'text-gray-800'
                      }`}>
                        {faq.question}
                      </h4>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {openIndex === index ? (
                        <MinusIcon className="h-6 w-6 text-purple-600 transform transition-transform duration-200" />
                      ) : (
                        <PlusIcon className="h-6 w-6 text-gray-500 hover:text-purple-600 transform transition-all duration-200" />
                      )}
                    </div>
                  </div>
                  {openIndex === index && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* FAQ Stats */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {faqs.length === 1 ? '1 question answered' : `${faqs.length} questions answered`}
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      <ShippingInfo />
    </>
  );
}
