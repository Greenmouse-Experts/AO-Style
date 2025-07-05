export default function StatsCard() {
  const stats = [
    {
      image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980408/AoStyle/Group_38685_igl2sv.png",
      value: 57,
      label: "Total Orders",
    },
    {
      image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980408/AoStyle/Group_38686_m8snct.png", 
      value: 57,
      label: "Ongoing Orders",
    },
    {
      image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980408/AoStyle/Group_386385_avoje8.png", 
      value: "N 120,000",
      label: "Total Spent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
