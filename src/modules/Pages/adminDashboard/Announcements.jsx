import { useState } from "react";

const AnnouncementsPage = () => {
    const [formData, setFormData] = useState({
        userType: "",
        announcement: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Notification sent:", formData);
        setFormData({ userType: "", announcement: "" });
    };

    return (
        <div className="">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <h2 className="text-xl font-medium text-gray-900 mb-6">Announcement</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-4">User Type</label>
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                            required
                        >
                            <option value="" disabled>
                                Choose user type
                            </option>
                            <option value="Customer">Customer</option>
                            <option value="Tailor">Tailor</option>
                            <option value="Vendors">Vendors</option>
                            <option value="Sales Rep">Sales Rep</option>
                            <option value="Logistics">Logistics</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">Announcement</label>
                        <textarea
                            name="announcement"
                            value={formData.announcement}
                            onChange={handleChange}
                            placeholder="Type in your announcement"
                            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg h-42 resize-none"
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient text-white py-4 rounded-md text-sm font-light"
                    >
                        Send Notification
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementsPage;