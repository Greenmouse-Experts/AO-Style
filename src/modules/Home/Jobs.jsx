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
} from "lucide-react";
import ShippingInfo from "./components/ShippingInfo";
import { Link } from "react-router-dom";
import Breadcrumb from "./components/Breadcrumb";
import useGetPublicJobs from "../../hooks/jobs/useGetPublicJobs";
import BeatLoader from "../../components/BeatLoader";
import JobApplicationModal from "./components/JobApplicationModal";

export default function JobBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

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

  const handleApplicationClose = () => {
    setShowApplicationModal(false);
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4 mr-2" />
              We're Hiring Amazing Talent
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Join Our Mission to{" "}
              <span className="text-purple-600">Revolutionize</span> the Fashion
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
              className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
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
                        ? "text-purple-600 border-purple-600"
                        : "text-gray-600 border-transparent hover:text-purple-600 hover:border-purple-300"
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
                className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                    
                    <div className="flex-shrink-0">
                      {job.application_url ? (
                        <a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Apply Now →
                        </a>
                      ) : (
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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

      <ShippingInfo />
    </>
  );
}
