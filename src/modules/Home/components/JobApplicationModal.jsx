import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUpload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useApplyForJob } from "../../../hooks/jobs/useApplyForJob";
import { useMutation } from "@tanstack/react-query";
import MediaService from "../../../services/api/multimedia";
import useToast from "../../../hooks/useToast";

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
      toastError(error.message || "Failed to upload document");
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
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toastError("Please upload a PDF or Word document");
        return;
      }

      // Validate file size (5MB limit)
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
    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }
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
      // First, upload the document
      const uploadFormData = new FormData();
      uploadFormData.append("document", formData.resume);

      uploadDocument(uploadFormData, {
        onSuccess: (uploadResponse) => {
          console.log("Upload response:", uploadResponse);

          // Extract URL from response - adjust this based on actual API response structure
          const documentUrl =
            uploadResponse?.data?.data?.url ||
            uploadResponse?.data?.url ||
            uploadResponse?.url;

          if (!documentUrl) {
            toastError("Failed to get document URL from upload response");
            setIsUploading(false);
            return;
          }

          // Then submit the application with the document URL
          const applicationData = {
            job_id: job.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            resume: documentUrl,
          };

          console.log("Application data:", applicationData);

          applyForJob(applicationData, {
            onSuccess: () => {
              setIsSubmitted(true);
              setIsUploading(false);
              // Close modal after 2 seconds
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
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
              // Success State
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaCheckCircle className="h-8 w-8 text-green-600" />
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
                <div className="animate-pulse text-sm text-gray-400">
                  This window will close automatically...
                </div>
              </div>
            ) : (
              // Application Form
              <>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Apply for Position
                      </h2>
                      <p className="text-purple-600 font-semibold">
                        {job.title}
                      </p>
                      {job.category && (
                        <p className="text-sm text-gray-500 mt-1">
                          {job.category.name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <FaTimes className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      <FaEnvelope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      <FaPhone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        {formData.resume ? (
                          <div className="flex items-center justify-center space-x-2">
                            <FaFileAlt className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">
                              {formData.resume.name}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
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

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting || isUploading}
                      className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
      )}
    </AnimatePresence>
  );
};

export default JobApplicationModal;
