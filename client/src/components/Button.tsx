import type { ComponentPropsWithoutRef } from "react";
import styles from "./Button.module.css";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  label: string;
  appearance?: "solid" | "outline" | "none" | "plain";
};

function Button({ appearance = "solid", label, ...buttonProps }: ButtonProps) {
  return (
    <button {...buttonProps} className={styles[appearance]}>
      {label}
    </button>
  );
}

export default Button;
