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
  return (
    <div data-theme="nord" className="p-2 static  " id="cus-app">
      <table className="w-full">
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
              // const popoverId = `popover-${nanoid()}`;
              // const anchorName = `--anchor-${nanoid()}`;
              return (
                <tr key={rowIdx}>
                  {props.columns?.map((col, colIdx) => (
                    <td
                      className="  text-ellipsis overflow-hidden"
                      key={colIdx}
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : item[col.key]}
                    </td>
                  ))}
                  {!props.columns?.find((item) => item.key == "action") && (
                    <>
                      <td className="">
                        <div className="dropdown dropdown-end ">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-square btn-ghost "
                          >
                            <span className="label">
                              <MenuIcon />
                            </span>
                          </div>
                          <ul
                            tabIndex={0}
                            className="z-50 dropdown-content menu bg-base-100 rounded-box  w-52 p-2 shadow-sm"
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
                        </div>

                        {/*<div
                            role="button"
                            className="btn btn-square btn-ghost m-1"
                          >
                            <span>
                              <MenuIcon />
                            </span>
                            <ul className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-xl ">
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
                          </div>*/}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
