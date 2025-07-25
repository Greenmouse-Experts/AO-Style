export default function StatsCard() {
    const stats = [
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742273107/AoStyle/Group_38685_ycsbd5.png",
        value: 87,
        label: "Total Registered Users",
      },
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742498125/AoStyle/Group_38685_alonno.png", 
        value: 17,
        label: "Tailor/Fashion Designers",
      },
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742498126/AoStyle/Group_386852_asfflk.png", 
        value: "15",
        label: "Materials Vendors",
      },
      {
        image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742498126/AoStyle/Group_38686_aoujfx.png", 
        value: "N200,000",
        label: "Commission Earned",
      },
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-4 gap-6">
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
  