import { useState, useMemo } from "react";
import {
  Search,
  ArrowUpRight,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Star,
  Filter,
  X,
  FileText,
  Upload,
  Calendar,
  Building,
  ExternalLink,
  CheckCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import useGetPublicJobs from "../../../hooks/jobs/useGetPublicJobs";
import BeatLoader from "../../../components/BeatLoader";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import { useApplyForJob } from "../../../hooks/jobs/useApplyForJob";
import { useMutation } from "@tanstack/react-query";
import MediaService from "../../../services/api/multimedia";
import useToast from "../../../hooks/useToast";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);

  // Navigation and authentication
  const navigate = useNavigate();
  const { carybinUser } = useCarybinUserStore();

  // Fetch jobs from API
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
  } = useGetPublicJobs();

  // Process the API data - only show published jobs
  const jobs = (jobsData?.data || []).filter(
    (job) => job.status === "PUBLISHED"
  );

  // Handle job application
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  // Handle view job
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  // Handle apply from job modal
  const handleApplyFromModal = () => {
    setShowJobModal(false);
    setShowApplicationModal(true);
  };

  const handleApplicationClose = () => {
    setShowApplicationModal(false);
    if (!showJobModal) {
      setSelectedJob(null);
    }
  };

  const handleJobModalClose = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  // Create categories array with "All Jobs" first
  const categories = useMemo(() => {
    const jobCategories = jobs
      .filter((job) => job.category && job.category.name)
      .map((job) => job.category.name);
    const uniqueCategories = [...new Set(jobCategories)].sort();
    return ["All Jobs", ...uniqueCategories];
  }, [jobs]);

  // Filter jobs based on search query and selected category
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (activeCategory !== "All Jobs") {
        if (!job.category || job.category.name !== activeCategory) {
          return false;
        }
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesDescription = job.description
          .toLowerCase()
          .includes(query);

        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, activeCategory, searchQuery]);

  // --- Job Application Modal Component ---
  const JobApplicationModal = ({ job, isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      resume: null,
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { mutate: applyForJob, isLoading: isSubmitting } = useApplyForJob();
    const { toastError } = useToast();

    // Upload document mutation
    const { mutate: uploadDocument } = useMutation({
      mutationFn: MediaService.uploadDocument,
      onError: (error) => {
        toastError(error?.data?.message || "Failed to upload document");
      },
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
          toastError("Please upload a PDF or Word document");
          return;
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toastError("File size must be less than 5MB");
          return;
        }
        setFormData((prev) => ({
          ...prev,
          resume: file,
        }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.resume
      ) {
        toastError("Please fill in all required fields");
        return;
      }
      setIsUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("document", formData.resume);

        uploadDocument(uploadFormData, {
          onSuccess: (uploadResponse) => {
            const documentUrl =
              uploadResponse?.data?.data?.url ||
              uploadResponse?.data?.url ||
              uploadResponse?.url;

            if (!documentUrl) {
              toastError("Failed to get document URL from upload response");
              setIsUploading(false);
              return;
            }

            const applicationData = {
              job_id: job.id,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              resume: documentUrl,
            };

            applyForJob(applicationData, {
              onSuccess: () => {
                setIsSubmitted(true);
                setIsUploading(false);
                setTimeout(() => {
                  onClose();
                  setIsSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    resume: null,
                  });
                }, 2000);
              },
              onError: (error) => {
                console.error("Application submission error:", error);
                setIsUploading(false);
              },
            });
          },
          onError: (error) => {
            console.error("Document upload error:", error);
            setIsUploading(false);
          },
        });
      } catch (error) {
        setIsUploading(false);
        toastError("Failed to process application");
      }
    };

    const handleClose = () => {
      if (!isSubmitting && !isUploading) {
        onClose();
        setFormData({
          name: "",
          email: "",
          phone: "",
          resume: null,
        });
        setIsSubmitted(false);
      }
    };

    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {isSubmitted ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for applying to{" "}
                <span className="font-semibold text-purple-600">
                  {job.title}
                </span>
                . We'll review your application and get back to you soon.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Apply for Position
                    </h2>
                    <p className="text-purple-600 font-semibold text-sm sm:text-base">
                      {job.title}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="text-gray-500 h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer block">
                      {formData.resume ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-600 font-medium truncate">
                            {formData.resume.name}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">
                            Click to upload your resume
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            PDF, DOC, or DOCX (max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting || isUploading}
                    className="px-4 sm:px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-sm sm:text-base"
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>
                          {isUploading ? "Uploading..." : "Submitting..."}
                        </span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  };

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Job Opportunities
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <BeatLoader />
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Job Opportunities
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">
              Error loading jobs. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rounded-t-lg">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6 rounded-t-lg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Career Opportunities
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Find Your Dream Job in{" "}
              <span className="text-violet-600">Fashion</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore exciting opportunities to grow your career in the fashion
              industry
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Job Role"
              className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-200 shadow-sm text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories Navigation - Horizontal Scroll on Mobile */}
          <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
            <div className="flex gap-2 border-b border-gray-200 min-w-max">
              {categories.map((category) => {
                const jobCount =
                  category === "All Jobs"
                    ? jobs.length
                    : jobs.filter(
                        (job) => job.category && job.category.name === category
                      ).length;

                return (
                  <button
                    key={category}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                      activeCategory === category
                        ? "text-violet-600 border-violet-600"
                        : "text-gray-600 border-transparent hover:text-violet-600 hover:border-violet-300"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category} ({jobCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Count & Clear Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="text-sm text-gray-600">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'}
            </div>
            {(searchQuery || activeCategory !== "All Jobs") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All Jobs");
                }}
                className="flex items-center justify-center space-x-2 px-4 py-2 text-violet-600 hover:text-violet-800 font-medium rounded-lg border border-violet-200 hover:border-violet-300 transition-colors text-sm w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Content */}
      <div className="px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-white px-4">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || activeCategory !== "All Jobs"
                  ? "No matching positions found"
                  : "No positions available"}
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {searchQuery || activeCategory !== "All Jobs"
                  ? "Try adjusting your search criteria or browse all available positions."
                  : "Check back soon for new opportunities!"}
              </p>
              {(searchQuery || activeCategory !== "All Jobs") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All Jobs");
                  }}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm sm:text-base"
                >
                  View all positions
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredJobs.map((job, index) => (
                <div
                  key={job.id}
                  className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                    index !== filteredJobs.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {/* Job Card: Column on Mobile, Row on Desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                    
                    {/* Content Section */}
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {job.type}
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </span>
                        )}
                        {job.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs sm:text-sm">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {job.category.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Section: Row on Mobile, Column on Desktop */}
                    <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleViewJob(job)}
                        className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm whitespace-nowrap"
                      >
                        View Details
                      </button>

                      {job.application_url ? (
                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 font-medium text-sm whitespace-nowrap"
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 font-medium text-sm whitespace-nowrap"
                        >
                          Apply Now →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Application Modal */}
      <AnimatePresence>
        {showApplicationModal && selectedJob && (
          <JobApplicationModal
            job={selectedJob}
            isOpen={showApplicationModal}
            onClose={handleApplicationClose}
          />
        )}
      </AnimatePresence>

      {/* Job View Modal */}
      <AnimatePresence>
        {showJobModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
            onClick={handleJobModalClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] p-4 sm:p-6 text-white flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-3">
                      {selectedJob.title}
                    </h2>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-white/90">
                      {selectedJob.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">
                            {selectedJob.location}
                          </span>
                        </div>
                      )}
                      {selectedJob.type && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">{selectedJob.type}</span>
                        </div>
                      )}
                      {selectedJob.category && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">
                            {selectedJob.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleJobModalClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Posted Date
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {new Date(selectedJob.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Status
                        </span>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        {selectedJob.status}
                      </span>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#9847FE]" />
                      Job Description
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                        {selectedJob.description}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  {selectedJob.requirements && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#9847FE]" />
                        Requirements
                      </h3>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                          {selectedJob.requirements}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* External Application Link */}
                  {selectedJob.application_url && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          External Application
                        </span>
                      </div>
                      <p className="text-amber-700 text-sm mb-3">
                        This position requires applying through an external
                        website.
                      </p>
                      <a
                        href={selectedJob.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                      >
                        Apply Externally
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={handleJobModalClose}
                    className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    Close
                  </button>
                  {!selectedJob.application_url && (
                    <button
                      onClick={handleApplyFromModal}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 font-medium flex justify-center items-center gap-2 text-sm sm:text-base"
                    >
                      Apply for this Job
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}