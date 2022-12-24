type TMatrix<T> = Array<Array<T>>;
type TMatrixItem = {
  itemId?: number;
  itemScale?: string;
  pos: string;
};

/**
 * Retrieves iterative indexes of search string on given string
 * @param searchString Given string
 * @param value Search string
 * @returns Indexes of found search string
 */
function iterativeTextSearch(searchString: string, value: string): number[] {
  const step = value.length;
  const indexes: number[] = [];

  for (let i = 0; i < searchString.length; i++) {
    if (i + step > searchString.length) break;
    const part = searchString.substring(i, i + step);
    if (part.match(value)) indexes.push(i);
  }

  return indexes;
}

/**
 * Calculates common indexes between founded row indexes
 * @param arr1 First row found indexes
 * @param arr2 Second row found indexes
 * @returns Common Indexes
 */
function findCommonIndexes(
  arr1: number[],
  arr2: number[]
): Array<number | undefined> {
  return arr1.filter((i) => arr2.includes(i));
}

/**
 * Retrieves maximum integer value of given matrix
 * @param matrix Given matrix
 * @returns Max integer value
 */
function maxMatrixInteger(matrix: TMatrix<number>): number {
  const row = matrix.length;
  const col = matrix[0].length;
  let maxValue: number = 0;
  for (let i = 0; i < row; i += 1) {
    for (let k = 0; k < col; k += 1) {
      const currentCell = matrix[i][k];
      if (currentCell > maxValue) maxValue = currentCell;
    }
  }

  return maxValue;
}

class Matrix {
  matrix: TMatrix<number> = [];
  colCount = 0;
  itemIndex = 0;
  sizeBlockDelimeter = "x";

  constructor({
    colCount,
    itemIndex = 0,
    initMatrix,
  }: {
    colCount: number;
    itemIndex?: number;
    initMatrix?: TMatrix<number>;
  }) {
    this.itemIndex = itemIndex;

    if (initMatrix?.length) {
      this.matrix = initMatrix;
      this.colCount = initMatrix[0].length;
      this.itemIndex = maxMatrixInteger(initMatrix);
    } else this.colCount = colCount;
  }

  get matrixRows() {
    return this.matrix.map((i) => i.join(""));
  }

  get orderedList() {
    const orderedList: TMatrixItem[] = [];

    this.iterateOverMatrix((i, k) => {
      const currentEl = this.matrix[i][k];
      const pos = `${i}-${k}`;

      if (currentEl !== 0) {
        const isInList = orderedList.findIndex(
          ({ itemId }) => itemId === currentEl
        );

        if (isInList === -1) {
          orderedList.push({
            itemId: currentEl,
            itemScale: this.getItemScaleById(currentEl),
            pos,
          });
        }
      } else {
        orderedList.push({ pos });
      }
    });

    return orderedList;
  }

  get rowCount() {
    return this.matrix.length;
  }

  get lastIndex() {
    return this.itemIndex;
  }

  get current() {
    return this.matrix;
  }

  iterateOverMatrix(cb: (a: number, b: number) => void) {
    for (let i = 0; i < this.rowCount; i += 1) {
      for (let k = 0; k < this.colCount; k += 1) {
        cb(i, k);
      }
    }
  }

  addRow(rowCount: number) {
    Array.from({ length: rowCount }, (_) => {
      this.matrix.push([..."0".repeat(this.colCount).split("").map(Number)]);
    });
  }

  getCoordinatesByPos(pos: string) {
    const [row, col] = pos.split("-").map(Number);
    return { row, col };
  }

  getItemStartPosition(itemId: number) {
    let position = [0, 0];
    search: for (let i = 0; i < this.rowCount; i += 1) {
      for (let k = 0; k < this.colCount; k += 1) {
        const currentItem = this.matrix[i][k];
        if (currentItem === itemId) {
          position = [i, k];
          break search;
        }
      }
    }
    return position;
  }

  swapItems(sourceId: number, destId: number) {
    this.iterateOverMatrix((i: number, k: number) => {
      const currentEl = this.matrix[i][k];

      if (currentEl === destId) this.matrix[i][k] = sourceId;
      else if (currentEl === sourceId) this.matrix[i][k] = destId;
    });

    return this.orderedList;
  }

  moveItemToPos(itemId: number, destPos: string) {
    const { row, col } = this.getCoordinatesByPos(destPos);

    // Explode source location
    this.iterateOverMatrix((i, k) => {
      const currentEl = this.matrix[i][k];

      if (currentEl === itemId) this.matrix[i][k] = 0;
    });

    this.matrix[row][col] = itemId;

    return this.orderedList;
  }

  removeItem(itemId: number) {
    this.iterateOverMatrix((i, k) => {
      const currentEl = this.matrix[i][k];
      if (currentEl === itemId) this.matrix[i][k] = 0;
    });

    return this.orderedList;
  }

  resizeItem(itemId: number, newSize: string) {
    const [row] = this.getItemStartPosition(itemId);
    const matrixSlice1 = this.matrix.slice(0, row);
    const matrixSlice = this.matrix.slice(row);

    const tempMatrix = new Matrix({
      colCount: this.colCount,
      initMatrix: matrixSlice,
    });

    const itemList = tempMatrix.orderedList.filter((i) => i.itemId);

    tempMatrix.resetMatrix(this.colCount);

    itemList.forEach((i) => {
      tempMatrix.insertMatrix(
        0,
        0,
        i.itemId === itemId ? newSize : i.itemScale,
        i.itemId
      );
    });

    this.matrix = [...matrixSlice1, ...tempMatrix.current];

    return this.orderedList;
  }

  getItemScaleById(itemId: number) {
    const itemMatrix: TMatrix<number> = this.matrixRows.reduce((prev, next) => {
      const found = iterativeTextSearch(next, `${itemId}`);

      // @ts-ignore
      return [...prev].concat(found.length ? [found] : []);
    }, []);

    return `${itemMatrix[0].length}x${itemMatrix.length}`;
  }

  getItemMapping({ itemId, itemScale, pos }: TMatrixItem) {
    return `${itemId}::${itemScale}::${pos}`;
  }

  getMatrixSizesFromSizeBlock(sizeBlock: string) {
    return sizeBlock
      ? sizeBlock.split(this.sizeBlockDelimeter).map(Number)
      : [];
  }

  allocateMatrix(col: number, row: number) {
    const colString = "0".repeat(col);
    const matrixStrings = this.matrixRows;

    if (this.rowCount === 0) {
      this.addRow(row);
      return "0-0";
    }

    let prevIndexes = {};
    for (let i = 0; i < matrixStrings.length; i += 1) {
      const part = [...matrixStrings].splice(i, row);
      if (part.length < row) break;
      const firstLineIndexes = iterativeTextSearch(part[0], colString);
      if (firstLineIndexes.length) {
        // @ts-ignore
        prevIndexes[i] = [...part].splice(i + 1).reduce((prev, indexes) => {
          return findCommonIndexes(
            prev,
            iterativeTextSearch(indexes, colString)
          );
        }, firstLineIndexes);
      }
    }

    const indexes: [string, number[]][] = Object.entries(prevIndexes);
    if (indexes.length) {
      return `${indexes[0][0]}-${indexes[0][1][0]}`;
    } else {
      const lastRowIndexes = iterativeTextSearch(
        // @ts-ignore
        matrixStrings.at(-1),
        colString
      );

      if (lastRowIndexes.length) {
        this.addRow(row - 1);
        return `${matrixStrings.length - 1}-${lastRowIndexes[0]}`;
      }

      this.addRow(row);
      return `${matrixStrings.length}-0`;
    }
  }

  // sizeBlock ? 2x2, 1x1
  insertMatrix(col: number, row: number, sizeBlock?: string, itemId?: number) {
    const block = sizeBlock || `${col}x${row}`;
    const [blockCol, blockRow] = this.getMatrixSizesFromSizeBlock(block);

    const location = this.allocateMatrix(blockCol, blockRow);
    const [insertRow, insertCol] = location.split("-").map(Number);
    if (!itemId) this.itemIndex += 1; // [WARNING]: May break index

    for (let i = insertRow; i < insertRow + blockRow; i += 1) {
      for (let k = insertCol; k < insertCol + blockCol; k += 1) {
        this.matrix[i][k] = itemId || this.itemIndex;
      }
    }

    const item: TMatrixItem = {
      itemId: this.itemIndex,
      itemScale: block,
      pos: location,
    };

    return item;
  }

  resetMatrix(colCount?: number) {
    this.matrix = [];
    this.itemIndex = 0;
    this.colCount = colCount || this.colCount;
  }

  reconcileMatrix(colCount?: number) {
    const prevItems = this.orderedList.filter(({ itemId }) => itemId);
    this.resetMatrix(colCount || undefined);

    for (const item of prevItems) {
      this.insertMatrix(0, 0, item.itemScale, item.itemId);
    }

    return this.orderedList;
  }
}

export default Matrix;
