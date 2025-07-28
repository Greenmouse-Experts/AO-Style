import React, { useState } from 'react';
import PdfModal from './PdfModal';
import agreementPdf from '../Agreement between Carybin and Fabric Vendors.pdf';

const AgreementViewer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPdfModal = () => {
    setIsModalOpen(true);
  };

  const closePdfModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Agreement Document
          </h3>
          <p className="text-gray-600 mb-4">
            View the agreement between Carybin and Fabric Vendors
          </p>

          <button
            onClick={openPdfModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>View Agreement</span>
          </button>

          <div className="mt-4 text-sm text-gray-500">
            <p>Click to open in full-screen viewer</p>
            <p>• Zoom in/out • Download option • Print ready</p>
          </div>
        </div>
      </div>

      <PdfModal
        isOpen={isModalOpen}
        onClose={closePdfModal}
        pdfUrl={agreementPdf}
        title="Agreement between Carybin and Fabric Vendors"
      />
    </div>
  );
};

export default AgreementViewer;
