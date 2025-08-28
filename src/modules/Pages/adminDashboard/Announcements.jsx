import { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaUsers,
  FaPaperPlane,
  FaList,
  FaEye,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaSpinner,
  FaExclamationCircle,
  FaCheck,
} from "react-icons/fa";

const AnnouncementsManager = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    role: "",
  });

  // Mock API functions - replace with your actual API calls
  const sendAnnouncement = async (payload) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add to announcements list for demo
      const newAnnouncement = {
        id: Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
        status: "sent",
      };

      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      setFormData({ subject: "", message: "", role: "" });

      return { success: true };
    } catch (err) {
      throw new Error("Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async (role = "") => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call to GET /announcements?role=user
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data - replace with actual API call
      const mockData = [
        {
          id: 1,
          subject: "Platform Maintenance Schedule",
          message:
            "We will be performing scheduled maintenance on Sunday, 3 AM - 5 AM UTC. Some services may be temporarily unavailable during this time.",
          role: "user",
          createdAt: "2025-01-15T10:30:00Z",
          status: "sent",
        },
        {
          id: 2,
          subject: "New Features Available",
          message:
            "Check out our latest features including improved order tracking and enhanced communication tools.",
          role: "fashion-designer",
          createdAt: "2025-01-14T14:20:00Z",
          status: "sent",
        },
        {
          id: 3,
          subject: "Payment System Update",
          message:
            "We've updated our payment system for faster and more secure transactions. Please update your payment methods if needed.",
          role: "fabric-vendor",
          createdAt: "2025-01-13T09:15:00Z",
          status: "sent",
        },
        {
          id: 4,
          subject: "Weekly Market Insights",
          message:
            "This week's market trends show increased demand for sustainable fabrics and eco-friendly materials.",
          role: "market-representative",
          createdAt: "2025-01-12T16:45:00Z",
          status: "sent",
        },
        {
          id: 5,
          subject: "Delivery Route Optimization",
          message:
            "We've optimized delivery routes in major cities to reduce delivery times by up to 30%.",
          role: "logistics-agent",
          createdAt: "2025-01-11T11:30:00Z",
          status: "sent",
        },
      ];

      // Filter by role if specified
      const filteredData = role
        ? mockData.filter((item) => item.role === role)
        : mockData;
      setAnnouncements(filteredData);
    } catch (err) {
      setError("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchAnnouncements(filterRole);
    }
  }, [activeTab, filterRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!navigator.onLine) {
      setError("No internet connection. Please check your network.");
      return;
    }

    if (!formData.subject || !formData.message || !formData.role) {
      setError("Please fill in all required fields.");
      return;
    }

    const roleMapping = {
      Customer: "user",
      Tailor: "fashion-designer",
      Fabric: "fabric-vendor",
      "Market Rep": "market-representative",
      Logistics: "logistics-agent",
    };

    const payload = {
      subject: formData.subject,
      message: formData.message,
      role: roleMapping[formData.role] || formData.role,
    };

    try {
      await sendAnnouncement(payload);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      user: "Customer",
      "fashion-designer": "Tailor",
      "fabric-vendor": "Fabric Vendor",
      "market-representative": "Market Rep",
      "logistics-agent": "Logistics",
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      user: "bg-blue-100 text-blue-800",
      "fashion-designer": "bg-purple-100 text-purple-800",
      "fabric-vendor": "bg-green-100 text-green-800",
      "market-representative": "bg-orange-100 text-orange-800",
      "logistics-agent": "bg-indigo-100 text-indigo-800",
    };
    return colorMap[role] || "bg-gray-100 text-gray-800";
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaBullhorn className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          </div>
          <p className="text-gray-600">
            Manage and send announcements to specific user groups across the
            platform.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("create")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "create"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaPaperPlane className="inline h-4 w-4 mr-2" />
              Create Announcement
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "view"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaList className="inline h-4 w-4 mr-2" />
              View Announcements
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Announcement Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FaPaperPlane className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Create Announcement
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUsers className="inline h-4 w-4 mr-2" />
                      Target User Type
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="" disabled>
                        Choose user type
                      </option>
                      <option value="Customer">Customer</option>
                      <option value="Tailor">Tailor</option>
                      <option value="Fabric">Fabric Vendor</option>
                      <option value="Market Rep">Market Rep</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter announcement subject"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your announcement message here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                      rows={8}
                      required
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.message.length}/500 characters
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                        Sending Announcement...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="h-4 w-4 mr-2" />
                        Send Announcement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Preview Card */}
              {(formData.subject || formData.message) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Preview
                  </h3>
                  <div className="space-y-3">
                    {formData.role && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          {formData.role}
                        </span>
                      </div>
                    )}
                    {formData.subject && (
                      <div>
                        <p className="text-sm text-gray-600">Subject:</p>
                        <p className="font-medium text-gray-900">
                          {formData.subject}
                        </p>
                      </div>
                    )}
                    {formData.message && (
                      <div>
                        <p className="text-sm text-gray-600">Message:</p>
                        <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                          {formData.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tips Card */}
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Announcement Tips
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Keep your subject line clear and concise</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Use professional and friendly language</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Target the right user group for relevance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      Keep messages under 500 characters when possible
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === "view" && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Roles</option>
                      <option value="user">Customer</option>
                      <option value="fashion-designer">Tailor</option>
                      <option value="fabric-vendor">Fabric Vendor</option>
                      <option value="market-representative">Market Rep</option>
                      <option value="logistics-agent">Logistics</option>
                    </select>
                    <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {filteredAnnouncements.length} announcements found
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <FaSpinner className="animate-spin h-8 w-8 text-purple-600" />
                  <span className="ml-3 text-gray-600">
                    Loading announcements...
                  </span>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center py-12">
                  <FaEye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No announcements found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || filterRole
                      ? "Try adjusting your search or filter criteria."
                      : "No announcements have been sent yet."}
                  </p>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {announcement.subject}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(announcement.role)}`}
                          >
                            {getRoleDisplayName(announcement.role)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <FaCalendarAlt className="h-4 w-4 mr-1" />
                            {formatDate(announcement.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <FaCheck className="h-4 w-4 mr-1 text-green-500" />
                            Sent
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {announcement.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;
