import { useEffect, useState } from "react";

interface CustomTabs {
  onChange?: (item: any) => any;
  values?: any[];
  defaultValue?: string;
}
export default function CustomTabs(props: CustomTabs) {
  const filterTabs = ["All", "Pending", "Invites", "Approved"];
  const [currTab, setCurrTab] = useState("All");
  const updateTab = () => {
    if (!props.onChange) return;
    if (props.defaultValue !== currTab) {
      return props?.onChange(currTab);
    }
    props?.onChange(currTab);
  };
  useEffect(() => {
    updateTab();
  }, [currTab]);
  return (
    <div data-theme="nord">
      <div className="tabs tabs-lift  min-w-max py-2 *:[--tab-border-color:#9847FE]">
        {filterTabs.map((item) => {
          if (item == currTab) {
            return (
              <div className="tab tab-primary tab-lift tab-active">{item}</div>
            );
          }
          return (
            <div className="tab tab-lift" onClick={() => setCurrTab(item)}>
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
