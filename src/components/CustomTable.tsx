import { Menu, Edit, Trash2 } from "lucide-react"; // Import additional icons
import { nanoid } from "nanoid";

type ColumnType = {
  key: string;
  label: string;
  render?: (value: any, item: any) => JSX.Element | string;
};

type Action = {
  key: string;
  label: string;
  action: (item: any) => void;
  icon?: JSX.Element; // Optional icon for each action
};

interface CustomTableProps {
  data?: any[];
  columns?: ColumnType[];
  actions?: Action[];
  user?: any;
}

export default function CustomTable({
  data = [],
  columns = [],
  actions = [],
}: CustomTableProps) {
  return (
    <div data-theme="nord" className="p-4">
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* Table Head */}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="capitalize text-base-content"
                >
                  {column.label}
                </th>
              ))}
              {!columns.some((item) => item.key === "action") && (
                <th scope="col" className="text-base-content">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIdx) => {
              const dropdownId = `dropdown-${nanoid()}`;
              return (
                <tr key={rowIdx} className="hover:bg-base-200">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap max-w-xs truncate text-base-content"
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : item[col.key]}
                    </td>
                  ))}
                  {!columns.some((item) => item.key === "action") && (
                    <td>
                      <div className="dropdown dropdown-end dropdown-bottom">
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          type="button"
                          aria-label="Open actions menu"
                          role="button"
                          tabIndex={0}
                        >
                          <Menu className="w-5 h-5 text-primary" />
                        </button>
                        <ul
                          className="dropdown-content menu w-52 p-2 bg-base-100 shadow-xl rounded-box border border-base-300"
                          role="menu"
                        >
                          {actions.map((action) => (
                            <li key={action.key} role="menuitem">
                              <button
                                onClick={() => action.action(item)}
                                className="flex items-center gap-2 text-base-content hover:bg-base-200"
                              >
                                {action.icon || (
                                  <Edit className="w-4 h-4 text-primary" />
                                )}
                                {action.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
