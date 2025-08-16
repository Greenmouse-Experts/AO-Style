import { MenuIcon } from "lucide-react";
import { nanoid } from "nanoid";
// import CaryBinApi from "../services/CarybinBaseUrl";
// import { Link } from "react-router-dom";

type columnType = {
  key: string;
  label: string;
  render?: (value: any, item: any) => any;
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
    <div data-theme="nord" className="p-2  " id="cus-app">
      <div className="overflow-x-scroll static">
        <table className="table static">
          {/* head */}
          <thead>
            <tr>
              {props.columns &&
                props.columns.map((column) => (
                  <th className="capitalize">{column.label}</th>
                ))}
              {!props.columns?.find((item) => item.key == "action") && (
                <>
                  <th>Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {props.data &&
              props.data.map((item, rowIdx) => {
                const popoverId = `popover-${nanoid()}`;
                const anchorName = `--anchor-${nanoid()}`;
                return (
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
                    {!props.columns?.find((item) => item.key == "action") && (
                      <>
                        <td>
                          <button
                            className="btn btn-square label btn-ghost"
                            popoverTarget={popoverId}
                            style={
                              {
                                anchorName: anchorName,
                              } /* as React.CSSProperties */
                            }
                          >
                            <MenuIcon />
                          </button>
                          <ul
                            className="dropdown dropdown-bottom dropdown-end menu w-52 rounded-box bg-base-100 shadow-xl"
                            popover="auto"
                            id={popoverId}
                            style={
                              {
                                positionAnchor: anchorName,
                              } /* as React.CSSProperties */
                            }
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
                          </ul>
                        </td>
                      </>
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
