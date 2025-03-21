import { useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const faqs = [
  { question: "How can I register on OASTYLES?", answer: "To register, simply visit our website and click on the 'Sign Up' button." },
  { question: "Can I get my clothes from anywhere in the country?", answer: "Yes, we deliver nationwide through our trusted logistics partners." },
  { question: "How can I get started?", answer: "Getting started is easy! Sign up, browse our collections, and place your order." },
  { question: "How do I know my right measurement?", answer: "We provide a measurement guide to help you find the perfect fit." },
  { question: "How do I know my right measurement?", answer: "We provide a measurement guide to help you find the perfect fit." },
  { question: "How do I know my right measurement?", answer: "We provide a measurement guide to help you find the perfect fit." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4 mt-6 bg-white shadow-md max-w-5xl mx-auto rounded-lg overflow-hidden">
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
        ))}
      </div>
    </div>
  );
}
