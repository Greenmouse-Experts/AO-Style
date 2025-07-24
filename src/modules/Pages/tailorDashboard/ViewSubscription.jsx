import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBriefcase, FaTimes } from "react-icons/fa";

const ViewSubscription = ({ onClose, currentView }) => {
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
          className="bg-white/95 backdrop-blur-md rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
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
                  <p className="text-sm text-gray-500">Subscription Details</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-500">Plan Validity</p>
                    <p className="font-medium">{currentView?.planValidity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-500">Plan Price</p>
                    <p className="font-medium text-xs">{currentView?.amount}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{currentView?.dateAdded}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{currentView?.max_quantity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">
                      {currentView?.subscription_plan_prices[0]?.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Subscrption Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  {currentView?.description}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
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

export default ViewSubscription;
