import {
  createContext,
  useContext,
  useState,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import { ChevronDown } from "lucide-react";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Accordion({
  type = "single",
  collapsible = true,
  className = "",
  children,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const isOpen = prev.includes(value);

      if (type === "single") {
        if (isOpen) return collapsible ? [] : prev;
        return [value];
      }

      if (isOpen) return prev.filter((item) => item !== value);
      return [...prev, value];
    });
  };

  return (
    <AccordionContext.Provider
      value={{ openItems, toggleItem, type, collapsible }}
    >
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: ReactNode;
}

export function AccordionItem({ value, children }: AccordionItemProps) {
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, index) =>
          isValidElement(child)
            ? cloneElement(child, { value, key: index })
            : child
        )}
      </>
    );
  }

  if (isValidElement(children)) {
    return cloneElement(children, { value });
  }

  return <>{children}</>;
}

interface AccordionTriggerProps {
  value?: string;
  className?: string;
  children?: ReactNode;
}

export function AccordionTrigger({
  value,
  className = "",
  children,
}: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context)
    throw new Error("AccordionTrigger must be used within Accordion");

  const { openItems, toggleItem } = context;
  const isOpen = value ? openItems.includes(value) : false;

  return (
    <button
      onClick={() => value && toggleItem(value)}
      className={`flex justify-between items-center w-full ${className}`}
    >
      <span>{children}</span>
      <ChevronDown
        className={`w-4 h-4 transition-transform ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      />
    </button>
  );
}

interface AccordionContentProps {
  value?: string;
  className?: string;
  children?: ReactNode;
}

export function AccordionContent({
  value,
  className = "",
  children,
}: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context)
    throw new Error("AccordionContent must be used within Accordion");

  const { openItems } = context;
  const isOpen = value ? openItems.includes(value) : false;

  if (!isOpen) return null;
  return <div className={className}>{children}</div>;
}
