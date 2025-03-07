import { TruckIcon, ChatBubbleBottomCenterTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Features = () => {
  const features = [
    {
      icon: <TruckIcon className="w-8 h-8 text-[#E070BB]" />, 
      title: "Shipping", 
      description: "We ship across Nigeria. T&C Apply"
    },
    {
      icon: <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-[#E070BB]" />, 
      title: "Customer Services", 
      description: "A question? Contact us at +234-000-0000000"
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 text-[#E070BB]" />, 
      title: "Secure Payments", 
      description: "Your payment information is processed securely"
    }
  ];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center just Resizer">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 text-center md:text-left">
          {feature.icon}
          <div>
            <h3 className="font-semibold text-lg leading-loose">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Features;
