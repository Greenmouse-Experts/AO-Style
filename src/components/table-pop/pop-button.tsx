import { Menu } from "lucide-react";
import { useState } from "react";
import { usePopper } from "react-popper";
type Actions = {
  key: string;
  label: string;
  action: (item: any) => any;
};
type item = any;
export default function PopUp(props: { actions: Actions[]; item: any }) {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        data-theme="nord"
        ref={setReferenceElement}
        onClick={togglePopup}
        className="btn btn-square"
      >
        <Menu className="label" />
      </div>
      {isOpen && (
        <div
          className="card card-border bg-base-100 shadow-lg p-2 z-50"
          ref={setPopperElement}
          {...attributes.popper}
          style={styles.popper}
        >
          <div className="card-body p-0">
            <div className="flex flex-col gap-2">
              {props?.actions?.map((action) => (
                <button
                  key={action.key}
                  className="btn btn-ghost btn-sm justify-start"
                  onClick={() => action.action(props.item)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
