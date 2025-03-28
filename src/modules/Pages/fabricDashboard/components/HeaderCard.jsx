export default function HeaderCard() {
  return (
    <div
      className="relative text-white p-6 rounded-xl flex flex-col space-y-4"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1741981133/AoStyle/Group_1321315063_1_r319ub.jpg')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "250px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="bg-white/20 text-white px-6 py-2 rounded-md flex items-center w-fit text-sm space-x-2">
      <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980774/AoStyle/uis_calender_vabz81.png" alt="Calendar" className="w-4 h-4" />
        <span>Feb 14, 2025</span>
      </div>      
      <h2 className="text-2xl font-medium mt-14">Welcome, Chukka 👋</h2>
      <p className="text-sm text-white/80">Have a great day!</p>
    </div>
  );
}

