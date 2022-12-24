import React from "react";
import { WindowSizeEnumKeys } from "@webclient/config/Sizes";

const mediaQueries: Omit<Record<WindowSizeEnumKeys, string>, "xs"> = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export const WindowSizeContext = React.createContext<{
  windowSize: WindowSizeEnumKeys;
}>({ windowSize: "md" });

export function useWindowSize() {
  const windowSize = React.useContext(WindowSizeContext);

  return windowSize;
}

export default function WindowSizeProvider({ children }) {
  const [windowSize, setWindowSize] = React.useState<WindowSizeEnumKeys>("md");

  React.useEffect(() => {
    const mm = Object.keys(mediaQueries).map((size) =>
      window.matchMedia(mediaQueries[size])
    );

    const calculateWindowSize: () => WindowSizeEnumKeys = () => {
      if (mm[4].matches) return "2xl";
      else if (mm[3].matches) return "xl";
      else if (mm[2].matches) return "lg";
      else if (mm[1].matches) return "md";
      else if (mm[0].matches) return "sm";
      else return "xs";
    };

    mm.forEach(
      (m) =>
        (m.onchange = () => {
          setWindowSize(calculateWindowSize());
        })
    );

    setWindowSize(calculateWindowSize());
  }, []);

  return (
    <WindowSizeContext.Provider value={{ windowSize }}>
      {children}
    </WindowSizeContext.Provider>
  );
}
