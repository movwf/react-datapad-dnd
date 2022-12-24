export enum WindowSizes {
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
}
export type WindowSizeEnumKeys = keyof typeof WindowSizes;

export function getGridColCount(windowSize: WindowSizeEnumKeys) {
  return {
    xs: 2,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    "2xl": 5,
  }[windowSize];
}

export const MAX_COL_SIZE = 3;
export const MIN_COL_SIZE = 1;
export const MAX_ROW_SIZE = 2;
export const MIN_ROW_SIZE = 1;

export type TDashboardItemSizes = "small" | "medium" | "large";

export const DashboardItemSizes: {
  [key in TDashboardItemSizes]:
    | { all: string }
    | {
        [key in WindowSizeEnumKeys]?: string;
      };
} = {
  small: {
    all: "1x1",
  },
  medium: {
    all: "2x1",
  },
  large: {
    xs: "2x2",
    sm: "2x2",
    md: "2x2",
    lg: "3x2",
    xl: "3x2",
    "2xl": "3x2",
  },
};

export const scaleToItemSizes: { [key: string]: TDashboardItemSizes } = {
  "3x2": "large",
  "2x2": "large",
  "2x1": "medium",
  "1x1": "small",
};

export const getMetricScale = (
  metricSize: TDashboardItemSizes,
  windowSize: WindowSizeEnumKeys
): [number, number] => {
  const scale =
    DashboardItemSizes[metricSize]["all"] ||
    DashboardItemSizes[metricSize][windowSize];
  return scale.split("x").map(Number);
};
