import React from "react";
import { Truck, MessageSquareText, ShieldCheck } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Truck className="w-10 h-10 text-[#E070BB]" />, 
      title: "Shipping", 
      description: "We ship across Nigeria. T&C Apply"
    },
    {
      icon: <MessageSquareText className="w-10 h-10 text-[#E070BB]" />, 
      title: "Customer Services", 
      description: "A question? We are here to assist you."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-[#E070BB]" />, 
      title: "Secure Payments", 
      description: "Your payment information is processed securely"
    }
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 just Resizer px-4">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="flex flex-col md:flex-row items-center text-center md:text-left bg-white p-6 rounded-lg w-full sm:w-[80%] md:w-1/3"
        >
          <div className="mb-3 md:mb-0 md:mr-4">{feature.icon}</div>
          <div>
          <h3 className="font-medium text-lg leading-loose">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Features;
