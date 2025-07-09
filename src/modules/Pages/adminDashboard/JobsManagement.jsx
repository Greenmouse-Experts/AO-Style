import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaBriefcase,
  FaEllipsisV,
  FaToggleOn,
  FaToggleOff,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaEdit,
  FaTags,
  FaEye,
  FaTimes,
  FaLink,
  FaCalendarAlt,
  FaBuilding,
  FaFileAlt,
  FaDownload,
  FaUser,
  FaPhone,
} from "react-icons/fa";
import useGetJobs from "../../../hooks/jobs/useGetJobs";
import useCreateJob from "../../../hooks/jobs/useCreateJob";
import useUpdateJob from "../../../hooks/jobs/useUpdateJob";
import useUpdateJobStatus from "../../../hooks/jobs/useUpdateJobStatus";
import useDeleteJob from "../../../hooks/jobs/useDeleteJob";
import useGetJobCategories from "../../../hooks/jobs/useGetJobCategories";
import useCreateJobCategory from "../../../hooks/jobs/useCreateJobCategory";
import useUpdateJobCategory from "../../../hooks/jobs/useUpdateJobCategory";
import useDeleteJobCategory from "../../../hooks/jobs/useDeleteJobCategory";
import { useGetJobApplications } from "../../../hooks/jobs/useGetJobApplications";
import { useDeleteApplication } from "../../../hooks/jobs/useDeleteApplication";
import useToast from "../../../hooks/useToast";
import BeatLoader from "../../../components/BeatLoader";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

const JobsManagementPage = () => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showJobView, setShowJobView] = useState(false);
  const [showJobEditForm, setShowJobEditForm] = useState(false);
  const [showDeleteJobModal, setShowDeleteJobModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showApplicationsView, setShowApplicationsView] = useState(false);
  const [showDeleteApplicationModal, setShowDeleteApplicationModal] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deletingApplication, setDeletingApplication] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("jobs"); // jobs or categories
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    slug: "",
    description: "",
    requirements: "",
    location: "",
    type: "Full-time",
    job_category_id: "",
    application_url: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    type: "TECH", // Default to TECH as shown in the API
  });

  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useGetJobs();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useGetJobCategories();

  const { createJobMutate, isPending: isCreatingJob } = useCreateJob();
  const { updateJobMutate, isPending: isUpdatingJob } = useUpdateJob();
  const { updateJobStatusMutate, isPending: isUpdatingStatus } =
    useUpdateJobStatus();
  const { deleteJobMutate, isPending: isDeletingJob } = useDeleteJob();

  const { createJobCategoryMutate, isPending: isCreatingCategory } =
    useCreateJobCategory();
  const { updateJobCategoryMutate, isPending: isUpdatingCategory } =
    useUpdateJobCategory();
  const { deleteJobCategoryMutate, isPending: isDeletingCategory } =
    useDeleteJobCategory();

  const { data: applicationsData, isLoading: applicationsLoading } = useGetJobApplications(
    selectedJobForApplications?.id
  );
  const { mutate: deleteApplicationMutate, isLoading: isDeletingApplication } = useDeleteApplication();

  const { toastError } = useToast();

  const jobs = jobsData?.data || [];
  const categories = categoriesData?.data || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicking outside any dropdown
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title only for new jobs (not when editing)
    if (name === "title" && !editingJob) {
      const baseSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // Remove special characters except spaces
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
      
      // Add timestamp to make slug unique
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const slug = baseSlug ? `${baseSlug}-${timestamp}` : timestamp;
      
      setJobFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!jobFormData.title.trim()) {
      toastError("Job title is required");
      return;
    }
    
    if (!jobFormData.description.trim()) {
      toastError("Job description is required");
      return;
    }
    
    // Prepare the payload with proper category ID
    const payload = {
      ...jobFormData,
      job_category_id: jobFormData.job_category_id || null, // Send null if no category selected
      application_url: jobFormData.application_url || "", // Send empty string if not provided
      // Ensure all text fields are trimmed
      title: jobFormData.title.trim(),
      description: jobFormData.description.trim(),
      requirements: jobFormData.requirements.trim(),
      location: jobFormData.location.trim(),
    };
    
    createJobMutate(payload, {
      onSuccess: () => {
        resetJobForm();
        setShowJobForm(false);
        refetchJobs(); // Refetch jobs after successful creation
      },
      onError: (error) => {
        // Error handling is already done in the hook, but we can add additional logic here if needed
        console.error("Job creation failed:", error);
      },
    });
  };

  const handleCategorySubmit = (e) => {
    handleCategorySubmitEdit(e);
  };

  const handleStatusToggle = (job) => {
    const newStatus = job.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    updateJobStatusMutate({
      id: job.id,
      payload: { status: newStatus },
    });
  };

  const handleJobDelete = (jobId) => {
    setDeletingJob(jobId);
    setShowDeleteJobModal(true);
    setActiveDropdown(null);
  };

  const confirmJobDelete = () => {
    if (deletingJob) {
      deleteJobMutate(deletingJob);
      setShowDeleteJobModal(false);
      setDeletingJob(null);
    }
  };

  const cancelJobDelete = () => {
    setShowDeleteJobModal(false);
    setDeletingJob(null);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobView(true);
    setActiveDropdown(null);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title,
      slug: job.slug,
      description: job.description,
      requirements: job.requirements || "",
      location: job.location || "",
      type: job.type,
      job_category_id: job.job_category_id || "",
      application_url: job.application_url || "",
    });
    setShowJobEditForm(true);
    setActiveDropdown(null);
  };

  const handleViewApplications = (job) => {
    setSelectedJobForApplications(job);
    setShowApplicationsView(true);
    setActiveDropdown(null);
  };

  const handleDeleteApplication = (applicationId) => {
    setDeletingApplication(applicationId);
    setShowDeleteApplicationModal(true);
  };

  const confirmDeleteApplication = () => {
    if (deletingApplication) {
      deleteApplicationMutate(deletingApplication, {
        onSuccess: () => {
          setShowDeleteApplicationModal(false);
          setDeletingApplication(null);
        }
      });
    }
  };

  const cancelDeleteApplication = () => {
    setShowDeleteApplicationModal(false);
    setDeletingApplication(null);
  };

  const handleDownloadResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleJobUpdate = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!jobFormData.title.trim()) {
      toastError("Job title is required");
      return;
    }
    
    if (!jobFormData.description.trim()) {
      toastError("Job description is required");
      return;
    }
    
    // Prepare the payload with proper category ID
    const payload = {
      ...jobFormData,
      job_category_id: jobFormData.job_category_id || null,
      application_url: jobFormData.application_url || "", // Send empty string if not provided
      // Ensure all text fields are trimmed
      title: jobFormData.title.trim(),
      description: jobFormData.description.trim(),
      requirements: jobFormData.requirements.trim(),
      location: jobFormData.location.trim(),
    };
    
    updateJobMutate(
      { id: editingJob.id, payload },
      {
        onSuccess: () => {
          resetJobForm();
          setShowJobEditForm(false);
          refetchJobs();
        },
        onError: (error) => {
          console.error("Job update failed:", error);
        },
      }
    );
  };

  const handleCategoryDelete = (categoryId) => {
    setDeletingCategory(categoryId);
    setShowDeleteCategoryModal(true);
    setActiveDropdown(null);
  };

  const confirmCategoryDelete = () => {
    if (deletingCategory) {
      deleteJobCategoryMutate(deletingCategory);
      setShowDeleteCategoryModal(false);
      setDeletingCategory(null);
    }
  };

  const cancelCategoryDelete = () => {
    setShowDeleteCategoryModal(false);
    setDeletingCategory(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      type: category.type,
    });
    setShowCategoryForm(true);
  };

  const handleCategorySubmitEdit = (e) => {
    e.preventDefault();
    if (categoryFormData.name.trim() && categoryFormData.type.trim()) {
      if (editingCategory) {
        // Update existing category
        updateJobCategoryMutate(
          {
            id: editingCategory.id,
            payload: categoryFormData,
          },
          {
            onSuccess: () => {
              setCategoryFormData({ name: "", type: "TECH" });
              setEditingCategory(null);
              setShowCategoryForm(false);
            },
          }
        );
      } else {
        // Create new category
        createJobCategoryMutate(categoryFormData, {
          onSuccess: () => {
            setCategoryFormData({ name: "", type: "TECH" });
            setShowCategoryForm(false);
          },
        });
      }
    }
  };

  const resetJobForm = () => {
    setJobFormData({
      title: "",
      slug: "",
      description: "",
      requirements: "",
      location: "",
      type: "Full-time",
      job_category_id: "",
      application_url: "",
    });
    setEditingJob(null);
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case "Full-time":
        return "bg-blue-100 text-blue-800";
      case "Part-time":
        return "bg-green-100 text-green-800";
      case "Contract":
        return "bg-yellow-100 text-yellow-800";
      case "Freelance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    return status === "PUBLISHED"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  if (jobsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BeatLoader />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] rounded-lg">
                  <FaBriefcase className="text-white text-xl" />
                </div>
                Jobs Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage job postings and categories
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "jobs"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "categories"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Categories
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <>
            {/* Add Job Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowJobForm(true)}
                className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white px-6 py-3 rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg"
              >
                <FaPlus className="text-sm" />
                <span>Add New Job</span>
              </button>
            </div>

            {/* Jobs Grid */}
            {jobs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      {/* Job Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <FaMapMarkerAlt className="text-xs" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <div className="relative dropdown-container">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === job.id ? null : job.id
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FaEllipsisV className="text-gray-500" />
                          </button>
                          {activeDropdown === job.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                              <button
                                onClick={() => handleViewJob(job)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
                              >
                                <FaEye className="text-blue-500" />
                                <span>View Job</span>
                              </button>
                              <button
                                onClick={() => handleViewApplications(job)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm border-t border-gray-100"
                              >
                                <FaFileAlt className="text-purple-500" />
                                <span>View Applications</span>
                              </button>
                              <button
                                onClick={() => handleEditJob(job)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm border-t border-gray-100"
                              >
                                <FaEdit className="text-green-500" />
                                <span>Edit Job</span>
                              </button>
                              <button
                                onClick={() => handleStatusToggle(job)}
                                disabled={isUpdatingStatus}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm border-t border-gray-100"
                              >
                                {job.status === "PUBLISHED" ? (
                                  <>
                                    <FaToggleOff className="text-gray-500" />
                                    <span>Set to Draft</span>
                                  </>
                                ) : (
                                  <>
                                    <FaToggleOn className="text-green-500" />
                                    <span>Publish</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleJobDelete(job.id)}
                                disabled={isDeletingJob}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center space-x-2 text-sm border-t border-gray-100"
                              >
                                <FaTrash />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(
                              job.type
                            )}`}
                          >
                            {job.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-3">
                          {job.description}
                        </p>

                        {job.requirements && (
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <FaUsers className="text-purple-500 text-xs mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-purple-700 mb-1">
                                  Requirements
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {job.requirements.length > 100
                                    ? `${job.requirements.substring(0, 100)}...`
                                    : job.requirements}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Job Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Created:{" "}
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          {job.application_url && (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800"
                            >
                              Apply Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto px-4">
                  <div className="p-6 bg-[#9847FE]/5 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
                    <FaBriefcase className="text-[#9847FE] text-2xl sm:text-3xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-3">
                    No Jobs Found
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed text-sm sm:text-base">
                    You haven't created any job postings yet. Start by adding
                    your first job to attract candidates.
                  </p>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white px-6 py-3 rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg mx-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Post Your First Job</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <>
            {/* Add Category Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({ name: "", type: "TECH" });
                  setShowCategoryForm(true);
                }}
                className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white px-6 py-3 rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg"
              >
                <FaPlus className="text-sm" />
                <span>Add New Category</span>
              </button>
            </div>

            {/* Categories Grid */}
            {categories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaTags className="text-purple-600 text-sm" />
                          <h3 className="font-semibold text-gray-900">
                            {category.name}
                          </h3>
                        </div>
                        <div className="my-2">
                          <h1 className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {category.type}
                          </h1>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created:{" "}
                          {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          disabled={isUpdatingCategory}
                          className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(category.id)}
                          disabled={isDeletingCategory}
                          className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto px-4">
                  <div className="p-6 bg-[#9847FE]/5 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center">
                    <FaTags className="text-[#9847FE] text-2xl sm:text-3xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-3">
                    No Categories Found
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed text-sm sm:text-base">
                    You haven't created any job categories yet. Start by adding
                    categories to organize your jobs.
                  </p>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white px-6 py-3 rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg mx-auto"
                  >
                    <FaPlus className="text-sm" />
                    <span>Create Your First Category</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Job Form Modal */}
        <AnimatePresence>
          {showJobForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowJobForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      Add New Job
                    </h2>
                    <button
                      onClick={() => setShowJobForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleJobSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={jobFormData.title}
                        onChange={handleJobFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (Auto-generated)
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={jobFormData.slug}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        placeholder="frontend-developer"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={jobFormData.location}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Lagos, Nigeria"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Type
                      </label>
                      <select
                        name="type"
                        value={jobFormData.type}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="job_category_id"
                        value={jobFormData.job_category_id}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application URL
                      </label>
                      <input
                        type="url"
                        name="application_url"
                        value={jobFormData.application_url}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com/apply"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      name="description"
                      value={jobFormData.description}
                      onChange={handleJobFormChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe the job role, responsibilities, and what you're looking for..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requirements
                    </label>
                    <textarea
                      name="requirements"
                      value={jobFormData.requirements}
                      onChange={handleJobFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="List the requirements, skills, and qualifications needed..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowJobForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingJob}
                      className="px-6 py-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isCreatingJob ? (
                        <>
                          <BeatLoader size={4} />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          <span>Create Job</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Edit Form Modal */}
        <AnimatePresence>
          {showJobEditForm && editingJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowJobEditForm(false);
                resetJobForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      Edit Job
                    </h2>
                    <button
                      onClick={() => {
                        setShowJobEditForm(false);
                        resetJobForm();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleJobUpdate} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={jobFormData.title}
                        onChange={handleJobFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (Auto-generated)
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={jobFormData.slug}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                        placeholder="frontend-developer"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={jobFormData.location}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. Lagos, Nigeria"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Type
                      </label>
                      <select
                        name="type"
                        value={jobFormData.type}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="job_category_id"
                        value={jobFormData.job_category_id}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application URL
                      </label>
                      <input
                        type="url"
                        name="application_url"
                        value={jobFormData.application_url}
                        onChange={handleJobFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com/apply"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      name="description"
                      value={jobFormData.description}
                      onChange={handleJobFormChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe the job role, responsibilities, and what you're looking for..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requirements
                    </label>
                    <textarea
                      name="requirements"
                      value={jobFormData.requirements}
                      onChange={handleJobFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="List the requirements, skills, and qualifications needed..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowJobEditForm(false);
                        resetJobForm();
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingJob}
                      className="px-6 py-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isUpdatingJob ? (
                        <>
                          <BeatLoader size={4} />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <FaEdit />
                          <span>Update Job</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Form Modal */}
        <AnimatePresence>
          {showCategoryForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
                setCategoryFormData({ name: "", type: "TECH" });
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-md rounded-xl max-w-md w-full shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setCategoryFormData({ name: "", type: "TECH" });
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. Software Development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Type *
                    </label>
                    <select
                      name="type"
                      value={categoryFormData.type}
                      onChange={handleCategoryFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="TECH">TECH</option>
                      <option value="GENERAL">GENERAL</option>
                      <option value="DESIGN">DESIGN</option>
                      <option value="MARKETING">MARKETING</option>
                      <option value="SALES">SALES</option>
                      <option value="ADMINISTRATION">ADMINISTRATION</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setCategoryFormData({ name: "", type: "TECH" });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingCategory || isUpdatingCategory}
                      className="px-6 py-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isCreatingCategory || isUpdatingCategory ? (
                        <>
                          <BeatLoader size={4} />
                          <span>
                            {editingCategory ? "Updating..." : "Creating..."}
                          </span>
                        </>
                      ) : (
                        <>
                          {editingCategory ? <FaEdit /> : <FaPlus />}
                          <span>
                            {editingCategory
                              ? "Update Category"
                              : "Create Category"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job View Modal */}
        <AnimatePresence>
          {showJobView && selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowJobView(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaBriefcase className="text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedJob.title}
                        </h2>
                        <p className="text-sm text-gray-500">Job Details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowJobView(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Job Status and Type */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200/50">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(
                        selectedJob.type
                      )}`}
                    >
                      {selectedJob.type}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedJob.status
                      )}`}
                    >
                      {selectedJob.status}
                    </span>
                  </div>

                  {/* Job Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">
                            {selectedJob.location || "Remote"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <FaBuilding className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Job ID</p>
                          <p className="font-medium text-xs">
                            {selectedJob.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">
                            {new Date(
                              selectedJob.created_at || selectedJob.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <FaTags className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium">
                            {selectedJob.job_category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <FaLink className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Slug</p>
                          <p className="font-medium">{selectedJob.slug}</p>
                        </div>
                      </div>

                      {selectedJob.application_url && (
                        <div className="flex items-center space-x-3">
                          <FaLink className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Application URL
                            </p>
                            <a
                              href={selectedJob.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-purple-600 hover:text-purple-700 truncate block"
                            >
                              {selectedJob.application_url}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Job Description
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedJob.description}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {selectedJob.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <FaUsers className="text-purple-500" />
                        <span>Requirements</span>
                      </h3>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedJob.requirements}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
                    <button
                      onClick={() => handleStatusToggle(selectedJob)}
                      disabled={isUpdatingStatus}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        selectedJob.status === "PUBLISHED"
                          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {selectedJob.status === "PUBLISHED" ? (
                        <>
                          <FaToggleOff />
                          <span>Set to Draft</span>
                        </>
                      ) : (
                        <>
                          <FaToggleOn />
                          <span>Publish Job</span>
                        </>
                      )}
                    </button>
                    {selectedJob.application_url && (
                      <a
                        href={selectedJob.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
                      >
                        <FaLink />
                        <span>View Application</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Applications View Modal */}
        <AnimatePresence>
          {showApplicationsView && selectedJobForApplications && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowApplicationsView(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FaFileAlt className="text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Applications for {selectedJobForApplications.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedJobForApplications.category?.name || 'No category'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowApplicationsView(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {applicationsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <BeatLoader />
                    </div>
                  ) : (
                    <>
                      {applicationsData?.data?.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <FaFileAlt className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            No Applications Yet
                          </h3>
                          <p className="text-gray-500">
                            No one has applied for this position yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {applicationsData?.data?.length || 0} Applications
                            </h3>
                          </div>
                          
                          {applicationsData?.data?.map((application) => (
                            <div
                              key={application.id}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                      <FaUser className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {application.name}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        {application.email}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-3">
                                    <span className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full border">
                                      <FaPhone className="h-3 w-3" />
                                      <span>{application.phone}</span>
                                    </span>
                                    <span className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full border">
                                      <FaCalendarAlt className="h-3 w-3" />
                                      <span>
                                        Applied {new Date(application.created_at).toLocaleDateString()}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {application.resume && (
                                    <button
                                      onClick={() => handleDownloadResume(application.resume)}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1 text-sm"
                                    >
                                      <FaEye className="h-3 w-3" />
                                      <span>View Resume</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleDeleteApplication(application.id)}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-1 text-sm"
                                  >
                                    <FaTrash className="h-3 w-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Application Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteApplicationModal}
          onClose={cancelDeleteApplication}
          onConfirm={confirmDeleteApplication}
          title="Delete Application"
          message="Are you sure you want to delete this application? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeletingApplication}
        />

        {/* Delete Job Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteJobModal}
          onClose={cancelJobDelete}
          onConfirm={confirmJobDelete}
          title="Delete Job"
          message="Are you sure you want to delete this job? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeletingJob}
        />

        {/* Delete Category Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteCategoryModal}
          onClose={cancelCategoryDelete}
          onConfirm={confirmCategoryDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeletingCategory}
        />
      </div>
    </div>
  );
};

export default JobsManagementPage;
