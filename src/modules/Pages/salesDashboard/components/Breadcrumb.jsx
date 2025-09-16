import React from "react";
import { FaHome, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  const defaultItems = [
    {
      label: "Dashboard",
      path: "/sales",
      icon: <FaHome className="w-4 h-4" />,
    },
  ];

  const allItems = [...defaultItems, ...items];

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {allItems.map((item, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            {item.path ? (
              <Link
                to={item.path}
                className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-1 text-gray-800 font-medium">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            )}
          </div>
          {index < allItems.length - 1 && (
            <FaChevronRight className="w-3 h-3 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
