import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={clsx("h-4 w-4 rounded border-line text-accent focus:ring-accent", className)}
        {...props}
      />
    );
  },
);

Checkbox.displayName = "Checkbox";

