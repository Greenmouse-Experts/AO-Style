import { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import Breadcrumb from "./components/Breadcrumb";
import ShippingInfo from "./components/ShippingInfo";

// FAQ data
const faqs = [
  { question: "What size am I?", answer: "Please refer to our size guide on the website to find your perfect fit." },
  { question: "Do you have a retail store?", answer: "Yes, we have multiple retail stores across the country." },
  { question: "Are your online stores open?", answer: "Yes, our online store is open 24/7 for your convenience." },
  { question: "What is your return/exchange policy?", answer: "We accept returns within 30 days of purchase. Items must be unworn and in original packaging." },
  { question: "How do I start an exchange/return?", answer: "To start an exchange or return, please visit our returns portal on our website and follow the instructions." },
  { question: "Do you ship internationally?", answer: "Yes, we offer international shipping to many countries worldwide." },
  { question: "How can I track my order?", answer: "Once your order is shipped, you will receive a tracking number via email." },
  { question: "Can I return a purchase I made online in-store?", answer: "Yes, you can return online purchases in-store with the original receipt." },
  { question: "What are your privacy policies/terms and conditions?", answer: "You can read our privacy policies and terms & conditions on our website." }
];

// Main FAQ component
export default function FAQsSectionPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        title="FAQs"
        subtitle="Frequently Asked Questions"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
      />

      {/* FAQ Section */}
      <div className="Resizer section px-4">
        <h2 className="text-2xl font-bold mb-10 text-center">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={`faq-${index}`}
              className={`border rounded-lg p-4 transition-all duration-300 cursor-pointer ${
                openIndex === index ? 'bg-gray-100 border-purple-400' : 'border-gray-300'
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h4 className="text-base font-medium text-gray-800">{faq.question}</h4>
                {openIndex === index ? (
                  <MinusIcon className="h-5 w-5 text-purple-600" />
                ) : (
                  <PlusIcon className="h-5 w-5 text-gray-600" />
                )}
              </div>
              {openIndex === index && (
                <p className="mt-3 text-sm text-gray-700">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <ShippingInfo />
    </>
  );
}
