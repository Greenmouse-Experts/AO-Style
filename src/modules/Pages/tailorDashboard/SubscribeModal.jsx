import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBriefcase, FaTimes } from "react-icons/fa";

const SubscriptionModal = ({ onClose, currentView }) => {
  console.log(currentView);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-md rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            {" "}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {/* <div className="p-2 bg-purple-100 rounded-lg">
                  <FaBriefcase className="text-purple-600" />
                </div> */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {/* {selectedJob.title} */}
                    {currentView?.name}
                  </h2>
                  {/* <p className="text-sm text-gray-500">Subscription Details</p> */}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-500">
              Are you sure you want to subscribe?
            </p>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 cursor-pointer text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                // onClick={() => handleStatusToggle(selectedJob)}
                className={`px-4 py-2 rounded-lg hover:shadow-lg cursor-pointer duration-200 transition-colors flex items-center space-x-2 bg-gradient-to-r hover:from-[#8036D3] from-[#9847FE] to-[#8036D3] text-white hover:to-[#6B2BB5] `}
              >
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
