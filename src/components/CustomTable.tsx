import { MenuIcon } from "lucide-react";
import { nanoid } from "nanoid";
import PopUp from "./table-pop/pop-button";
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
  return (
    <div data-theme="nord" className="" id="cus-app">
      <div className=" relative overflow-x-scroll">
        <table className="table   w-full text-xs">
          <thead className="">
            <tr className=" rounded-2xl bg-base-200/50">
              {props.columns &&
                props.columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="capitalize text-left   text-xs font-semibold text-base-content/70 "
                  >
                    {column.label}
                  </th>
                ))}
              {!props.columns?.find((item) => item.key == "action") && (
                <>
                  <th className="font-semibold text-xs text-base-content/70 ">
                    Action
                  </th>
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
                  <tr
                    key={rowIdx}
                    className="hover:bg-base-200 border-base-300"
                  >
                    {props.columns?.map((col, colIdx) => (
                      <td
                        className="py-3 px-4 text-ellipsis overflow-hidden max-w-xs text-base-content"
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
                          <PopUp actions={props.actions} item={item} />
                        </td>
                        {/*<td className="py-3 px-4   relative">
                          <div className="dropdown dropdown-end relative">
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-square btn-ghost btn-sm hover:bg-base-300"
                            >
                              <MenuIcon className="size-6 label" />
                            </div>
                            <ul
                              // tabIndex={0}
                              className="z-50 dropdown-content menu bg-base-100 rounded-lg border border-base-300 w-52 p-2 shadow-lg"
                            >
                              {props.actions?.map((action, actionIdx) => {
                                return (
                                  <li key={actionIdx}>
                                    <button
                                      onClick={() => action.action(item)}
                                      className="text-left hover:bg-base-200 rounded-md px-3 py-2 text-base-content"
                                    >
                                      {action.label}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </td>*/}
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
