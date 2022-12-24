import React, { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

interface IPortal {
  children: ReactNode;
  className?: string;
  onClick?: any;
  onDragOver?: any;
  style?: { [key in keyof CSSProperties]?: string };
  disableOverlay?: boolean;
}

export const Portal: React.FC<IPortal> = ({
  children,
  className,
  onClick,
  onDragOver,
  style,
  disableOverlay = false,
}) => {
  const ref = React.useRef<Element | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    ref.current = document.getElementById("portal-node");
    setMounted(true);
  }, []);

  return mounted && ref.current
    ? createPortal(
        <div className="relative h-full w-full">
          <div
            id="portal-backdrop"
            className={className}
            // @ts-ignore
            style={style}
            onClick={onClick}
            onDragOver={onDragOver}
          />
          {children}
        </div>,
        ref.current
      )
    : null;
};
