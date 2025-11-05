import React from 'react';

const ViewDetailsModal = ({ isOpen, onClose, data, dataType }) => {
  if (!isOpen || !data) return null;

  const renderStatusBadge = (status) => {
    let className = "px-3 py-1 text-sm rounded-md ";
    let label = "";

    if (dataType === "approved") {
      if (status?.profile?.approved_by_admin === null) {
        className += "bg-yellow-100 text-yellow-600";
        label = "Pending";
      } else if (status?.profile?.approved_by_admin) {
        className += "bg-green-100 text-green-600";
        label = "Approved";
      } else {
        className += "bg-red-100 text-red-600";
        label = "Expired";
      }
    } else {
      // For invites/pending/rejected
      if (status?.status === "active") {
        className += "bg-green-100 text-green-600";
        label = "Active";
      } else if (status?.status === "pending") {
        className += "bg-yellow-100 text-yellow-600";
        label = "Pending";
      } else if (status?.status === "expired") {
        className += "bg-red-100 text-red-600";
        label = "Expired";
      } else {
        className += "bg-red-100 text-red-600";
        label = "Rejected";
      }
    }

    return <span className={className}>{label}</span>;
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/40 bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Market Representative Details</h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">Name</label>
            <p className="text-base text-gray-900 mt-1">{data.name || "N/A"}</p>
          </div>

          {/* Email */}
          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">Email</label>
            <p className="text-base text-gray-900 mt-1">{data.email || "N/A"}</p>
          </div>

          {/* User Type / Role */}
          {(data.userType || data.role?.name) && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">User Type</label>
              <p className="text-base text-gray-900 mt-1 capitalize">
                {data.userType || data.role?.name || "N/A"}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">Status</label>
            <div className="mt-1">{renderStatusBadge(data)}</div>
          </div>

          {/* Date Added */}
          <div className="border-b pb-3">
            <label className="text-sm text-gray-500 font-medium">Date Added</label>
            <p className="text-base text-gray-900 mt-1">
              {data.created_at || "N/A"}
            </p>
          </div>

          {/* Expiry Date - for invites */}
          {data.expires_at && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">Expires At</label>
              <p className="text-base text-gray-900 mt-1">{data.expires_at}</p>
            </div>
          )}

          {/* Deleted Date - if applicable */}
          {data.deleted_at && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">Deleted At</label>
              <p className="text-base text-gray-900 mt-1">{data.deleted_at}</p>
            </div>
          )}

          {/* Token - if available */}
          {/* {data.token && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">Invitation Token</label>
              <p className="text-sm text-gray-900 mt-1 font-mono break-all">
                {data.token}
              </p>
            </div>
          )} */}

          {/* ID */}
          {data.id && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">ID</label>
              <p className="text-sm text-gray-900 mt-1 font-mono">{data.id?.replace(/-/g, "")?.slice(0, 12)?.toUpperCase()}</p>
            </div>
          )}

          {/* Is Owner */}
          {typeof data.is_owner !== 'undefined' && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">Is Owner</label>
              <p className="text-base text-gray-900 mt-1">
                {data.is_owner ? "Yes" : "No"}
              </p>
            </div>
          )}
{/* hi */}
          {/* User ID - if available */}
          {data.user?.id && (
            <div className="border-b pb-3">
              <label className="text-sm text-gray-500 font-medium">User ID</label>
              <p className="text-sm text-gray-900 mt-1 font-mono">{data.user.id?.replace(/-/g, "")?.slice(0, 12)?.toUpperCase()}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;