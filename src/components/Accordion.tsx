import { createContext, useContext, useState, ReactNode, cloneElement, isValidElement } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}

interface AccordionItemProps {
  value: string;
  children: ReactNode;
}

interface AccordionTriggerProps {
  className?: string;
  children: ReactNode;
  value?: string;
}

interface AccordionContentProps {
  className?: string;
  children: ReactNode;
  value?: string;
}

export function Accordion({ type = "single", collapsible = false, className = "", children }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      if (type === "single") {
        if (prev.includes(value)) {
          return collapsible ? [] : prev;
        }
        return [value];
      } else {
        if (prev.includes(value)) {
          return prev.filter((item) => item !== value);
        }
        return [...prev, value];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type, collapsible }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  return (
    <>
      {isValidElement(children) && Array.isArray(children)
        ? children.map((child, index) => {
            if (isValidElement(child)) {
              return cloneElement(child, { ...child.props, value, key: index });
            }
            return child;
          })
        : isValidElement(children)
        ? cloneElement(children, { ...children.props, value })
        : children}
    </>
  );
}

export function AccordionTrigger({ className = "", children, value }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionTrigger must be used within Accordion");

  const { openItems, toggleItem } = context;
  const isOpen = value ? openItems.includes(value) : false;

  return (
    <button
      onClick={() => value && toggleItem(value)}
      className={`flex items-center justify-between w-full ${className}`}
    >
      <span>{children}</span>
      <ChevronDown
        size={16}
        className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function AccordionContent({ className = "", children, value }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionContent must be used within Accordion");

  const { openItems } = context;
  const isOpen = value ? openItems.includes(value) : false;

  if (!isOpen) return null;
  return <div className={className}>{children}</div>;
}
