import { useState, useRef, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaQuestionCircle,
  FaEllipsisV,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import useGetFAQs from "../../../hooks/faq/useGetFAQs";
import useCreateFAQ from "../../../hooks/faq/useCreateFAQ";
import useToggleFAQStatus from "../../../hooks/faq/useToggleFAQStatus";
import useDeleteFAQ from "../../../hooks/faq/useDeleteFAQ";
import BeatLoader from "../../../components/BeatLoader";

const FAQManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });
  const dropdownRef = useRef(null);

  const {
    data: faqs,
    isLoading,
    refetch,
    totalCount,
    isFetching,
  } = useGetFAQs(currentPage, pageSize);
  const { createFAQMutate, isPending: isCreating } = useCreateFAQ();
  const { toggleFAQStatusMutate, isPending: isToggling } = useToggleFAQStatus();
  const { deleteFAQMutate, isPending: isDeleting } = useDeleteFAQ();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.question.trim() && formData.answer.trim()) {
      createFAQMutate(formData, {
        onSuccess: () => {
          setFormData({ question: "", answer: "" });
          setShowForm(false);
        },
      });
    }
  };

  const handleToggleStatus = (faq) => {
    const newStatus = !faq.is_active;
    toggleFAQStatusMutate(
      { id: faq.id, payload: { is_active: newStatus } },
      {
        onSuccess: () => {
          setActiveDropdown(null);
        },
      }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      deleteFAQMutate(id);
    }
    setActiveDropdown(null);
  };

  const handleCancel = () => {
    setFormData({ question: "", answer: "" });
    setShowForm(false);
  };

  const toggleDropdown = (faqId) => {
    setActiveDropdown(activeDropdown === faqId ? null : faqId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BeatLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] px-4 sm:px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FaQuestionCircle className="text-white text-xl sm:text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    FAQ Management
                  </h1>
                  <p className="text-purple-100 text-xs sm:text-sm mt-1">
                    Manage frequently asked questions for your platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-[#9847FE] px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                <FaPlus className="text-sm" />
                <span>Add New FAQ</span>
              </button>
            </div>
          </div>

          {/* Enhanced Add FAQ Form */}
          {showForm && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-8 py-6 border-b border-gray-200">
              <div className="max-w-2xl">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-[#9847FE]/10 rounded-lg mr-3">
                    <FaPlus className="text-[#9847FE]" />
                  </div>
                  Add New FAQ
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Question
                    </label>
                    <input
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Enter the FAQ question..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Answer
                    </label>
                    <textarea
                      name="answer"
                      value={formData.answer}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9847FE] focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Enter the FAQ answer..."
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white px-8 py-3 rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <FaPlus className="text-sm" />
                          <span>Add FAQ</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Enhanced FAQs Table */}
          <div className="p-4 sm:p-8">
            {faqs && faqs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      All FAQs
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Total {faqs.length} FAQ{faqs.length > 1 ? "s" : ""} found
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                          <th className="text-left py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider w-16">
                            №
                          </th>
                          <th className="text-left py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider min-w-48">
                            Question
                          </th>
                          <th className="text-left py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider min-w-64 hidden sm:table-cell">
                            Answer
                          </th>
                          <th className="text-left py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider w-28">
                            Status
                          </th>
                          <th className="text-left py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider w-24">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {faqs?.map((faq, index) => (
                          <tr
                            key={faq.id}
                            className="hover:bg-gray-50/50 transition-all duration-150"
                          >
                            <td className="py-4 sm:py-6 px-3 sm:px-6">
                              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-[#9847FE]/10 rounded-lg">
                                <span className="text-xs sm:text-sm font-bold text-[#9847FE]">
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 sm:py-6 px-3 sm:px-6">
                              <div className="max-w-xs sm:max-w-md">
                                <p className="font-semibold text-gray-900 leading-relaxed text-sm sm:text-base">
                                  {faq.question}
                                </p>
                                {/* Show answer on mobile */}
                                <p className="text-gray-600 text-xs mt-2 line-clamp-2 sm:hidden">
                                  {faq.answer}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 sm:py-6 px-3 sm:px-6 hidden sm:table-cell">
                              <div className="max-w-lg">
                                <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm">
                                  {faq.answer}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 sm:py-6 px-3 sm:px-6">
                              <span
                                className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-full border ${
                                  faq.is_active
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${
                                    faq.is_active
                                      ? "bg-emerald-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <span className="hidden sm:inline">
                                  {faq.is_active ? "Active" : "Inactive"}
                                </span>
                                <span className="sm:hidden">
                                  {faq.is_active ? "On" : "Off"}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 sm:py-6 px-3 sm:px-6">
                              <div
                                className="relative"
                                ref={
                                  activeDropdown === faq.id ? dropdownRef : null
                                }
                              >
                                <button
                                  onClick={() => toggleDropdown(faq.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                >
                                  <FaEllipsisV className="text-sm" />
                                </button>

                                {activeDropdown === faq.id && (
                                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                                    <button
                                      onClick={() => handleToggleStatus(faq)}
                                      disabled={isToggling}
                                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-150 disabled:opacity-50"
                                    >
                                      {faq.is_active ? (
                                        <>
                                          <div className="p-1.5 bg-red-100 rounded-lg mr-3">
                                            <FaToggleOff className="text-red-600 text-sm" />
                                          </div>
                                          <span className="font-medium">
                                            Set Inactive
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                                            <FaToggleOn className="text-green-600 text-sm" />
                                          </div>
                                          <span className="font-medium">
                                            Set Active
                                          </span>
                                        </>
                                      )}
                                    </button>
                                    <div className="border-t border-gray-100"></div>
                                    <button
                                      onClick={() => handleDelete(faq.id)}
                                      disabled={isDeleting}
                                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-150 disabled:opacity-50"
                                    >
                                      <div className="p-1.5 bg-red-100 rounded-lg mr-3">
                                        <FaTrash className="text-red-600 text-sm" />
                                      </div>
                                      <span className="font-medium">
                                        Delete FAQ
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Admin FAQs */}
                  {totalCount > pageSize && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Showing {(currentPage - 1) * pageSize + 1}-
                          {Math.min(currentPage * pageSize, totalCount || 0)} of{" "}
                          {totalCount || 0} FAQs
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1 || isFetching}
                            className={`px-3 py-1 rounded text-sm ${
                              currentPage === 1 || isFetching
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-purple-50"
                            }`}
                          >
                            Previous
                          </button>

                          {Array.from(
                            { length: Math.ceil((totalCount || 0) / pageSize) },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              disabled={isFetching}
                              className={`px-3 py-1 rounded text-sm ${
                                page === currentPage
                                  ? "bg-purple-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-purple-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(
                                  Math.ceil((totalCount || 0) / pageSize),
                                  prev + 1
                                )
                              )
                            }
                            disabled={
                              currentPage ===
                                Math.ceil((totalCount || 0) / pageSize) ||
                              isFetching
                            }
                            className={`px-3 py-1 rounded text-sm ${
                              currentPage ===
                                Math.ceil((totalCount || 0) / pageSize) ||
                              isFetching
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-purple-50"
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto px-4">
                  <div className="p-6 bg-[#9847FE]/5 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
                    <FaQuestionCircle className="text-[#9847FE] text-2xl sm:text-3xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-3">
                    No FAQs Found
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed text-sm sm:text-base">
                    You haven't created any frequently asked questions yet.
                    Start by adding your first FAQ to help your users.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white px-6 py-3 rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg mx-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Create Your First FAQ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQManagementPage;
