import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "../class-names";
import styles from "./Legend.module.css";

export type LegendProps = HTMLAttributes<HTMLLegendElement> & {
  metadata?: ReactNode;
};

/** Render as the first child of a native fieldset. Metadata must be non-interactive. */
export const Legend = forwardRef<HTMLLegendElement, LegendProps>(
  function Legend({ children, metadata, className, ...props }, ref) {
    return (
      <legend
        {...props}
        ref={ref}
        className={classNames(styles.root, className)}
      >
        <span className={styles.content}>
          <span>{children}</span>
          {metadata !== undefined &&
          metadata !== null &&
          metadata !== false &&
          metadata !== "" ? (
            <>
              {" "}
              <span className={styles.metadata}>{metadata}</span>
            </>
          ) : null}
        </span>
      </legend>
    );
  },
);
