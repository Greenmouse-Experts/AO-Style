import React from 'react';

const SummaryDetails = () => {
  const infoCards = [
    {
      title: 'Client Info',
      bgColor: 'bg-green-100',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      name: 'Chukka Uzo',
      role: 'Client',
      infoList: [
        '📱 0700 000 0000',
        '✉️ testmail@gmail.com',
        '📍 Lekki, Lagos state, Nigeria',
      ],
    },
    {
      title: 'Fabric Details',
      bgColor: 'bg-indigo-100',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      name: 'Tife Fabrics',
      role: 'Fabric Vendor',
      infoList: [
        'Fabric: Red Material',
        'Quantity: 4 yards',
        'Market: Main Market',
        'Price: N 200,000',
        'Phone: 0700 000 0000',
      ],
      status: 'Delivered',
    },
    {
      title: 'Tailor Details',
      bgColor: 'bg-pink-100',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      name: 'Daniel Styles',
      role: 'Tailor/Designer',
      infoList: [
        'Style: Male Agbada',
        'Time Frame: 5 Days',
        'Price: N 200,000',
        'Phone: 0700 000 0000',
      ],
      status: 'Completed',
    },
    {
      title: 'Delivery Info',
      bgColor: 'bg-blue-100',
      avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
      name: 'Speed Go',
      role: 'Logistic Agent',
      infoList: [
        'Pick Up: Ikeja, Ogba, Lagos',
        'Drop Off: Ikate, Lekki, Lagos',
        'Delivery Code: 32EW24',
      ],
      status: 'Completed',
    },
  ];

  return (
    <div className="">
      {/* Payment Config */}
      <div className="bg-white p-3 rounded-lg mb-6">
        <h3 className="text-sm font-medium mb-4 border-b pb-3 border-gray-200">Payment Configuration</h3>
        <div className="space-y-4 text-sm mb-4">
          <label className="flex items-center space-x-3">
            <input type="radio" name="payout" defaultChecked className="text-purple-600" />
            <span>Automatic Payout</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="radio" name="payout" className="text-purple-600" />
            <span>Manual PayOut</span>
          </label>
        </div>
      </div>

      {/* Info Cards */}
      {infoCards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-lg p-3 mb-6">
          <div className={`rounded-t-md px-4 py-4 text-sm font-medium ${card.bgColor} text-gray-700`}>
            {card.title}
          </div>
          <div className="mt-6 px-2">
            <div className="flex items-center gap-4 mb-4">
              <img src={card.avatar} alt={card.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <div className="font-medium leading-loose">{card.name}</div>
                <div className="text-xs text-green-600 leading-loose">{card.role}</div>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-3">
              {card.infoList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            {card.status && (
              <div className="mt-2 text-sm">
                Status: <span className="text-green-600 font-medium">{card.status}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryDetails;
