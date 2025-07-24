import { useState } from "react";
import { FaBullhorn, FaUsers, FaPaperPlane } from "react-icons/fa";
import useSendAnnouncement from "../../../hooks/announcement/useSendAnnouncement";

const AnnouncementsPage = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    role: "",
  });

  const { mutate: sendAnnouncement, isPending: isSending } =
    useSendAnnouncement();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
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
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaBullhorn className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          </div>
          <p className="text-gray-600">
            Send important announcements to specific user groups across the
            platform.
          </p>
        </div>

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
                  <span>Keep messages under 500 characters when possible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
