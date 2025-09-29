import { MenuIcon } from "lucide-react";
import { nanoid } from "nanoid";
import PopUp from "./table-pop/pop-button";
import { useState } from "react";
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
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  return (
    <div data-theme="nord" className="" id="cus-app">
      <div className="relative overflow-x-auto shadow-sm rounded-lg">
        <div className="overflow-visible">
          <table className="table w-full text-xs min-w-full">
            <thead className="">
              <tr className=" rounded-2xl bg-base-200/50">
                {props.columns &&
                  props.columns.map((column, idx) => (
                    <th
                      key={idx}
                      className="capitalize text-left px-4 py-3 text-xs font-semibold text-base-content/70 whitespace-nowrap"
                    >
                      {column.label}
                    </th>
                  ))}
                {!props.columns?.find((item) => item.key == "action") && (
                  <>
                    <th className="font-semibold text-xs text-base-content/70 px-4 py-3 whitespace-nowrap">
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
                      className="hover:bg-base-300 border-base-300"
                    >
                      {props.columns?.map((col, colIdx) => (
                        <td
                          className={`py-3 px-4 text-base-content ${
                            col.key === "action"
                              ? "relative overflow-visible"
                              : col.key === "id"
                                ? "text-ellipsis overflow-hidden min-w-[120px] max-w-[150px] font-mono"
                                : col.key === "location" ||
                                    col.key === "address"
                                  ? "text-ellipsis overflow-hidden max-w-[200px]"
                                  : "text-ellipsis overflow-hidden max-w-sm"
                          } ${col.key === "id" ? "select-all" : ""}`}
                          key={colIdx}
                          title={
                            col.key === "id" && col.render
                              ? undefined
                              : String(item[col.key] || "")
                          }
                        >
                          {col.render
                            ? col.render(item[col.key], item, rowIdx)
                            : item[col.key]}
                        </td>
                      ))}
                      {!props.columns?.find(
                        (item, index) => item.key == "action",
                      ) && (
                        <>
                          <td className="relative overflow-visible py-3 px-4">
                            <PopUp
                              itemIndex={rowIdx}
                              setIndex={setSelectedItem}
                              currentIndex={selectedItem}
                              key={rowIdx + "menu"}
                              actions={props?.actions || []}
                              item={item}
                            />
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
    </div>
  );
}
