import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TransactionDetailsModal from "./modals/TransactionDetailsModal";

const UniversalTransactionDetails = ({
  mode = "page", // "page" or "modal"
  isOpen,
  onClose,
  transactionId: propTransactionId
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Use prop transactionId or route param id
  const transactionId = propTransactionId || id;

  useEffect(() => {
    if (mode === "page") {
      // For page mode, show modal immediately
      setShowModal(true);
    } else if (mode === "modal") {
      // For modal mode, use the isOpen prop
      setShowModal(isOpen || false);
    }
  }, [mode, isOpen]);

  const handleClose = () => {
    if (mode === "page") {
      // Navigate back when in page mode
      navigate(-1);
    } else if (mode === "modal" && onClose) {
      // Call parent's onClose when in modal mode
      onClose();
    }
    setShowModal(false);
  };

  if (!transactionId) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-red-600 font-medium">No transaction ID provided</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <TransactionDetailsModal
      isOpen={showModal}
      onClose={handleClose}
      transactionId={transactionId}
    />
  );
};

export default UniversalTransactionDetails;
