import { Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { usePopper } from "react-popper";
import Portal from "../portal";
type Actions = {
  key: string;
  label: string;
  action: (item: any) => any;
};
type currentIndex = number;
type item = any;
export default function PopUp(props: {
  actions: Actions[];
  item: any;
  currentIndex: currentIndex | null;
  setIndex: (index: number | null) => void;
  itemIndex: number;
}) {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const togglePopup = () => {
    if (props.itemIndex === props.currentIndex) {
      return setIsOpen(true);
    }
    return setIsOpen(false);
  };

  useEffect(() => {
    togglePopup();
  }, [props.currentIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        referenceElement &&
        !referenceElement.contains(event.target as Node)
      ) {
        props.setIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, props.setIndex, referenceElement]);

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-end",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });
  const openPopup = () => {
    props.setIndex(props.itemIndex);
  };
  return (
    <>
      <div
        data-theme="nord"
        ref={setReferenceElement}
        onClick={openPopup}
        className="btn btn-square"
      >
        <Menu className="label" />
      </div>
      <Portal>
        {isOpen && (
          <div
            data-theme="nord"
            ref={(el) => {
              setPopperElement(el);
              popupRef.current = el;
            }}
            className="card card-border bg-base-100 shadow-lg p-2 z-50"
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
      </Portal>
    </>
  );
}
