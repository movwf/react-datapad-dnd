import type { TDashboardItemSizes } from "@webclient/config/Sizes";

export type TMetricMatrixListItem = {
  itemId?: number;
  itemScale?: string;
  pos?: string;
};

export type TMetricData = {
  [key: string]: any;
  size: TDashboardItemSizes;
};
