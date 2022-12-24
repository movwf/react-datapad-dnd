import Matrix from "./Matrix";
import {
  getGridColCount,
  getMetricScale,
  scaleToItemSizes,
  TDashboardItemSizes,
} from "../config/Sizes";
import type { WindowSizeEnumKeys } from "../config/Sizes";
import type { TMetricData } from "@webclient/types/Metric";

export const initializeDndGrid = ({
  windowSize,
  itemList,
}: {
  windowSize: WindowSizeEnumKeys;
  itemList: TMetricData[];
}) => {
  const colCount = getGridColCount(windowSize);
  const M = new Matrix({ colCount });

  const updatedList = itemList.slice();
  itemList.forEach((item, idx) => {
    const [col, row] = getMetricScale(item.size, windowSize);
    const { itemId, itemScale, pos } = M.insertMatrix(col, row);

    updatedList[idx] = {
      ...updatedList[idx],
      itemId,
      itemScale,
      pos,
    };
  });

  const orderedList = M.orderedList.map((item) => ({
    ...item,
    ...updatedList.find(({ itemId }) => item.itemId === itemId),
  }));

  return { orderedList, instance: M };
};

export const moveItem = ({
  sourceId,
  destPos,
  itemList,
  instance,
}: {
  sourceId: number;
  destPos: string;
  itemList: any[];
  instance: Matrix;
}) => {
  const M = instance;
  const dest = itemList.find(({ pos }) => pos === destPos);

  if (dest.itemId) {
    M.swapItems(sourceId, dest.itemId);
  } else {
    M.moveItemToPos(sourceId, destPos);
  }

  const updatedList = M.orderedList.reduce((prev, next) => {
    const listItem = itemList.find(({ itemId }) => itemId === next.itemId);

    return [
      ...prev,
      {
        ...listItem,
        pos: next.pos,
        ...(next.itemId
          ? { itemId: next.itemId, itemScale: next.itemScale }
          : {}),
        ...(next.itemId === sourceId
          ? { size: scaleToItemSizes[dest.itemScale || "1x1"] }
          : {}),
      },
    ];
  }, []);

  return updatedList;
};

export const addItem = ({
  metricData,
  destinationId,
  dropScale,
  itemList,
  instance,
}: {
  metricData: any;
  destinationId: number;
  dropScale: string;
  itemList: any[];
  instance: Matrix;
}) => {
  const M = instance;

  const pos = M.insertMatrix(1, 1);

  // [TEMPORARY] Visual only
  const updatedList = itemList.slice();
  updatedList[destinationId] = {
    itemId: M.lastIndex,
    pos,
    ...metricData,
  };

  return updatedList;
};

export const removeItem = ({
  itemId,
  instance,
  itemList,
}: {
  itemId: number;
  instance: Matrix;
  itemList: any[];
}) => {
  const M = instance;

  M.removeItem(itemId);

  const updatedList = M.orderedList.reduce((prev, next) => {
    const listItem = itemList.find(({ itemId }) => itemId === next.itemId);

    return [
      ...prev,
      {
        ...listItem,
        pos: next.pos,
        ...(next.itemId
          ? { itemId: next.itemId, itemScale: next.itemScale }
          : {}),
      },
    ];
  }, []);

  return updatedList;
};

export const resizeItem = ({
  itemId,
  nextSize,
  instance,
  itemList,
  windowSize,
}: {
  itemId: number;
  nextSize: TDashboardItemSizes;
  instance: Matrix;
  itemList: any[];
  windowSize: WindowSizeEnumKeys;
}) => {
  const M = instance;
  const [col, row] = getMetricScale(nextSize, windowSize);
  const newSize = `${col}x${row}`;

  M.resizeItem(itemId, newSize);

  const updatedList = M.orderedList.reduce((prev, next) => {
    const listItem = itemList.find(({ itemId }) => itemId === next.itemId);

    return [
      ...prev,
      {
        ...listItem,
        pos: next.pos,
        ...(next.itemId
          ? { itemId: next.itemId, itemScale: next.itemScale }
          : {}),
        ...(next.itemId === itemId
          ? { size: scaleToItemSizes[next.itemScale] }
          : {}),
      },
    ];
  }, []);

  return updatedList;
};
