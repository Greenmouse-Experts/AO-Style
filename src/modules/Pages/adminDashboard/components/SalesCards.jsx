export default function StatsCards() {
    const stats = [
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827212/AoStyle/Group_38685_lvqmtr.png",
        value: 87,
        label: "Tailors Onboarded",
      },
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827221/AoStyle/Group_38685_iz31fn.png", 
        value: 17,
        label: "Fabric Vendor Onboarded",
      },
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827244/AoStyle/Group_38685_p4bgt4.png", 
        value: "15",
        label: "Logistics Agent Onboarded",
      },
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742827223/AoStyle/Group_38685_qx6z7j.png", 
        value: "24",
        label: "Commission Earned",
      },
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-4 rounded-md">
            <div>
              <p className="text-xl font-bold leading-loose">{stat.value}</p>
              <p className="text-[#8299EA]">{stat.label}</p>
            </div>
            <div className={`w-20 h-20 flex items-center justify-center rounded-full`}>
              <img src={stat.image} alt={stat.label} className="w-14 h-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  