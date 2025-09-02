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
      <div className=" relative overflow-x-auto">
        <div className="overflow-visible">
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
                      className="hover:bg-base-300 border-base-300"
                    >
                      {props.columns?.map((col, colIdx) => (
                        <td
                          className={`py-3 px-4 text-base-content ${
                            col.key === "action"
                              ? "relative overflow-visible"
                              : "text-ellipsis overflow-hidden max-w-xs"
                          }`}
                          key={colIdx}
                        >
                          {col.render
                            ? col.render(item[col.key], item)
                            : item[col.key]}
                        </td>
                      ))}
                      {!props.columns?.find(
                        (item, index) => item.key == "action",
                      ) && (
                        <>
                          <td className="relative overflow-visible">
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
