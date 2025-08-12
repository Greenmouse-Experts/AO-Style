import { MenuIcon } from "lucide-react";
import CaryBinApi from "../services/CarybinBaseUrl";
import { Link } from "react-router-dom";

type columnType = {
  key: string;
  label: string;
  render?: () => any;
};

type Actions = {
  key: string;
  label: string;
  action: (item: any) => any;
};
interface CustomTableProps {
  data?: any[];
  columns?: columnType[];
  actions?: Actions[];
  user?: any;
}

export default function CustomTable(props: CustomTableProps) {
  // return <>{JSON.stringify(props.data)}</>;
  return (
    <div data-theme="" className="p-2 " id="cus-app">
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              {props.columns &&
                props.columns.map((column) => (
                  <th className="capitalize">{column.label}</th>
                ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {props.data &&
              props.data.map((item, rowIdx) => (
                <tr key={rowIdx}>
                  {props.columns?.map((col, colIdx) => (
                    <td
                      className="whitespace-nowrap max-w-sm text-ellipsis overflow-hidden"
                      key={colIdx}
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : item[col.key]}
                    </td>
                  ))}
                  <td>
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-circle btn-ghost m-1"
                      >
                        <MenuIcon />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                      >
                        {props.actions?.map((action) => {
                          return (
                            <li>
                              <button
                                onClick={() => action.action(item)}
                                className=""
                              >
                                {action.label}
                              </button>
                            </li>
                          );
                        })}
                        {/*<li>
                          <a>Item 2</a>
                        </li>*/}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
