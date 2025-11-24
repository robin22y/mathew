export function AccordionItem({ value, children }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionItem must be used within Accordion");

  // Case 1: children is an array
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, index) => {
          if (isValidElement(child)) {
            return cloneElement(child, { value, key: index });
          }
          return child;
        })}
      </>
    );
  }

  // Case 2: single child element
  if (isValidElement(children)) {
    return cloneElement(children, { value });
  }

  // Case 3: plain text / other
  return <>{children}</>;
}
