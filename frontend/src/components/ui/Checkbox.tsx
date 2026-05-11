import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={clsx("h-4 w-4 rounded border-line text-accent focus:ring-accent", className)}
      {...props}
    />
  );
}

