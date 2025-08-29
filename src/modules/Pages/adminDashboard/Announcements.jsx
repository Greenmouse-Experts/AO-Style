import { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaUsers,
  FaPaperPlane,
  FaList,
  FaPlus,
  FaCalendarAlt,
  FaUserTie,
} from "react-icons/fa";
import useSendAnnouncement from "../../../hooks/announcement/useSendAnnouncement";
import useToast from "../../../hooks/useToast";
import AnnouncementService from "../../../services/api/announcement";

const AnnouncementsPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    role: "",
  });
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const { mutate: sendAnnouncement, isPending: isSending } =
    useSendAnnouncement();

  const { toastError } = useToast();

  // Fetch admin announcements when the tab switches to "view"
  useEffect(() => {
    if (activeTab === "view") {
      fetchAdminAnnouncements();
    }
  }, [activeTab]);

  const fetchAdminAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const response = await AnnouncementService.getAdminAnnouncements();
      // Handle the nested data structure: response.data.data
      const announcementsData = response.data?.data || [];
      setAdminAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching admin announcements:", error);
      toastError("Failed to fetch announcements. Please try again.");
      setAdminAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }
    e.preventDefault();

    // Map the frontend role values to backend expected values using the correct mapping
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

    console.log("Sending announcement:", payload);

    sendAnnouncement(payload, {
      onSuccess: () => {
        // Reset form on success
        setFormData({ subject: "", message: "", role: "" });
        // Refresh admin announcements if we're on the view tab
        if (activeTab === "view") {
          fetchAdminAnnouncements();
        }
      },
    });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      user: "bg-blue-100 text-blue-800",
      "fashion-designer": "bg-purple-100 text-purple-800",
      "fabric-vendor": "bg-green-100 text-green-800",
      "market-representative": "bg-orange-100 text-orange-800",
      "logistics-agent": "bg-red-100 text-red-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      user: "Customer",
      "fashion-designer": "Tailor",
      "fabric-vendor": "Fabric Vendor",
      "market-representative": "Market Rep",
      "logistics-agent": "Logistics",
    };
    return roleNames[role] || role;
  };

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
            Create and manage announcements for different user groups across the
            platform.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "create"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaPlus className="h-4 w-4" />
                <span>Create Announcement</span>
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === "view"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaList className="h-4 w-4" />
                <span>View Sent Announcements</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "create" ? (
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

                <form onSubmit={handleSubmit} className="space-y-6">
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
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Announcement...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="h-4 w-4 mr-2" />
                        Send Announcement
                      </>
                    )}
                  </button>
                </form>
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

              {/* Info Card */}
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
        ) : (
          /* View Announcements Tab */
          <div className="space-y-6">
            {/* Header for announcements list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FaUserTie className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sent Announcements
                  </h2>
                </div>
                <button
                  onClick={fetchAdminAnnouncements}
                  disabled={loadingAnnouncements}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loadingAnnouncements ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <FaBullhorn className="h-4 w-4" />
                      <span>Refresh</span>
                    </>
                  )}
                </button>
              </div>

              {loadingAnnouncements ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">
                    Loading announcements...
                  </span>
                </div>
              ) : adminAnnouncements.length === 0 ? (
                <div className="text-center py-12">
                  <FaBullhorn className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No announcements found
                  </h3>
                  <p className="text-gray-500">
                    You haven't sent any announcements yet. Create your first
                    announcement using the "Create Announcement" tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminAnnouncements.map((announcement, index) => (
                    <div
                      key={announcement.id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleBadgeColor(
                              announcement.role,
                            )}`}
                          >
                            {getRoleDisplayName(announcement.role)}
                          </span>
                          {announcement.createdAt && (
                            <div className="flex items-center text-xs text-gray-500">
                              <FaCalendarAlt className="h-3 w-3 mr-1" />
                              {formatDate(announcement.createdAt)}
                            </div>
                          )}
                        </div>
                        {announcement.id && (
                          <span className="text-xs text-gray-400 font-mono">
                            ID: {announcement.id.substring(0, 8)}...
                          </span>
                        )}
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2">
                        {announcement.subject || "No subject"}
                      </h4>

                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {announcement.message || "No message content"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
