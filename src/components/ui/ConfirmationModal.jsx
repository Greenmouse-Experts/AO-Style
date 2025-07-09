import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaExclamationTriangle, FaTrash } from "react-icons/fa";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger", // danger, warning, info
  isLoading = false 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-100",
          icon: <FaTrash className="text-red-600" />,
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
          titleColor: "text-red-900"
        };
      case "warning":
        return {
          iconBg: "bg-yellow-100", 
          icon: <FaExclamationTriangle className="text-yellow-600" />,
          confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
          titleColor: "text-yellow-900"
        };
      default:
        return {
          iconBg: "bg-blue-100",
          icon: <FaExclamationTriangle className="text-blue-600" />,
          confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white", 
          titleColor: "text-blue-900"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${styles.iconBg}`}>
                    {styles.icon}
                  </div>
                  <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${styles.confirmBtn}`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
