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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShippingInfo from "./components/ShippingInfo";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "./components/Breadcrumb";
import useGetPublicJobs from "../../hooks/jobs/useGetPublicJobs";
import BeatLoader from "../../components/BeatLoader";
import JobApplicationModal from "./components/JobApplicationModal";
import { useCarybinUserStore } from "../../store/carybinUserStore";

export default function JobBoard() {
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

  // Handle job application with authentication check
  const handleApplyClick = (job) => {
    // Check if user is logged in
    if (!carybinUser) {
      // Redirect to login page if not authenticated
      navigate('/login');
      return;
    }
    
    // If authenticated, proceed with application
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  // Handle view job
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  // Handle apply from job modal with authentication check
  const handleApplyFromModal = () => {
    // Check if user is logged in
    if (!carybinUser) {
      // Close the job modal first, then redirect to login
      setShowJobModal(false);
      setSelectedJob(null);
      navigate('/login');
      return;
    }
    
    // If authenticated, proceed with application
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
    // Extract unique categories from jobs data
    const jobCategories = jobs
      .filter((job) => job.category && job.category.name) // Only jobs with valid categories
      .map((job) => job.category.name);

    // Remove duplicates and sort alphabetically
    const uniqueCategories = [...new Set(jobCategories)].sort();

    console.log("Available categories:", uniqueCategories);

    return ["All Jobs", ...uniqueCategories];
  }, [jobs]);

  // Filter jobs based on search query and selected category
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Filter by category
      if (activeCategory !== "All Jobs") {
        // Check if job has a category and if it matches the selected category
        if (!job.category || job.category.name !== activeCategory) {
          return false;
        }
      }

      // Filter by search query (search in title and description)
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

  // Loading state
  if (jobsLoading) {
    return (
      <>
        <Breadcrumb
          title="All Jobs"
          subtitle="All Jobs"
          backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744158706/AoStyle/image_i6goh8.jpg"
        />
        <div className="Resizer section px-4 flex items-center justify-center min-h-96">
          <BeatLoader />
        </div>
        <ShippingInfo />
      </>
    );
  }

  // Error state
  if (jobsError) {
    return (
      <>
        <Breadcrumb
          title="All Jobs"
          subtitle="All Jobs"
          backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744158706/AoStyle/image_i6goh8.jpg"
        />
        <div className="Resizer section px-4 flex items-center justify-center min-h-96">
          <div className="text-center">
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
        <ShippingInfo />
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        title="All Jobs"
        subtitle="All Jobs"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744158706/AoStyle/image_i6goh8.jpg"
      />
      <div className="Resizer section px-4">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4 mr-2" />
              We're Hiring Amazing Talent
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Join Our Mission to{" "}
              <span className="text-violet-600">Revolutionize</span> the Fashion
              Industry
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              We are looking for passionate people to join us on our mission. We
              value great work, clear communication, and shared responsibility.
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative mb-8 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Job Role"
              className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
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
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                      activeCategory === category
                        ? "text-violet-600 border-violet-600"
                        : "text-gray-600 border-transparent hover:text-violet-600 hover:border-violet-300"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Count Display */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              All Jobs ({filteredJobs.length})
            </div>
            {(searchQuery || activeCategory !== "All Jobs") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All Jobs");
                }}
                className="flex items-center space-x-2 px-4 py-2 text-violet-600 hover:text-violet-800 font-medium rounded-lg border border-violet-200 hover:border-violet-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || activeCategory !== "All Jobs"
                  ? "No matching positions found"
                  : "No positions available"}
              </h3>
              <p className="text-gray-600 mb-4">
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
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  View all positions
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                   className="border-t border-gray-200 py-6 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.type && (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {job.type}
                          </span>
                        )}
                        {job.location && (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <button
                        onClick={() => handleViewJob(job)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 font-medium text-sm"
                      >
                        View Job
                      </button>
                      
                      {job.application_url ? (
                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border-2 border-[#9847FE] text-[#9847FE] rounded-lg hover:bg-[#9847FE] hover:text-white transition-all duration-200 font-medium text-sm"
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="inline-flex items-center px-4 py-2 border-2 border-[#9847FE] text-[#9847FE] rounded-lg hover:bg-[#9847FE] hover:text-white transition-all duration-200 font-medium text-sm"
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
      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={showApplicationModal}
          onClose={handleApplicationClose}
        />
      )}

      {/* Job View Modal */}
      <AnimatePresence>
        {showJobModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
              {/* Header */}
              <div className="bg-gradient-to-r from-[#9847FE] to-[#8036D3] p-6 text-white flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl font-bold mb-3">{selectedJob.title}</h2>
                    <div className="flex flex-wrap gap-4 text-white/90">
                      {selectedJob.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{selectedJob.location}</span>
                        </div>
                      )}
                      {selectedJob.type && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{selectedJob.type}</span>
                        </div>
                      )}
                      {selectedJob.category && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-sm">{selectedJob.category.name}</span>
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Posted Date</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {new Date(selectedJob.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Status</span>
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
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                      <span className="text-sm font-medium text-amber-800">External Application</span>
                    </div>
                    <p className="text-amber-700 text-sm mb-3">
                      This position requires applying through an external website.
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

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={handleJobModalClose}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                  {!selectedJob.application_url && (
                    <button
                      onClick={handleApplyFromModal}
                      className="px-6 py-3 bg-gradient-to-r from-[#9847FE] to-[#8036D3] text-white rounded-lg hover:from-[#8036D3] hover:to-[#6B2BB5] transition-all duration-200 font-medium flex items-center gap-2"
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

      <ShippingInfo />
    </>
  );
}
