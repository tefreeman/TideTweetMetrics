import { ElementRef, QueryList } from '@angular/core';

export class MoveableGridTilesService {
  public dataArr: any[] = [];
  private positionArr: { x: number; y: number }[] = [];

  constructor(debug: boolean = false) {
    if (debug) {
      setInterval(() => {
        console.log(this.dataArr, this.positionArr);
      }, 1000);
    }
  }

  private setElementPositions(queryList: QueryList<ElementRef>) {
    queryList.forEach((elemRef, index) => {
      if (elemRef && elemRef.nativeElement) {
        const rect = elemRef.nativeElement.getBoundingClientRect();
        // Calc the center points
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.positionArr[index] = { x: centerX, y: centerY };
      }
    });
  }

  public update(queryList: QueryList<any>) {
    this.setElementPositions(queryList);
  }

  public swapClosestElements(index: number, dropPos: { x: number; y: number }) {
    if (index < 0 || index >= this.positionArr.length) {
      return;
    }

    // grid capacity calculations
    const itemsPerRow = this.determineItemsPerRow();
    const totalRows = Math.ceil(this.positionArr.length / itemsPerRow);
    const itemsInLastRow = this.positionArr.length % itemsPerRow || itemsPerRow;
    const dropInLastRowOrBelow = this.isDropInLastRowOrBelow(
      dropPos,
      itemsPerRow,
      totalRows,
      itemsInLastRow
    );

    // TODO: fix this logic
    // Either move the dragged item to the end or swap it with the closest item.
    //   if (dropInLastRowOrBelow) {
    //     this.moveToEnd(index);
    //   } else {
    //     this.performSwap(index, dropPos);
    //   }

    this.performSwap(index, dropPos);
  }

  private determineItemsPerRow(): number {
    if (this.positionArr.length < 2) {
      return this.positionArr.length;
    }

    const firstItemYPos = this.positionArr[0].y;
    const indexOfSecondRow = this.positionArr.findIndex(
      (pos) => pos.y !== firstItemYPos
    );

    if (indexOfSecondRow === -1) {
      return this.positionArr.length;
    }

    return indexOfSecondRow;
  }

  private isDropInLastRowOrBelow(
    dropPos: { x: number; y: number },
    itemsPerRow: number,
    totalRows: number,
    itemsInLastRow: number
  ): boolean {
    const lastItem = this.positionArr[this.positionArr.length - 1];
    if (!lastItem) {
      return false;
    }

    const estimatedRowHeight =
      lastItem.y - (this.positionArr[0]?.y || 0) / (totalRows - 1 || 1);
    const bottomOfGrid = lastItem.y + estimatedRowHeight;

    if (
      dropPos.y > bottomOfGrid ||
      (dropPos.y > lastItem.y && this.positionArr.length % itemsPerRow !== 0)
    ) {
      return true;
    }

    return false;
  }
  // Move the dragged item to the end if dropped in an extra space or below the grid.
  private moveToEnd(index: number) {
    const item = this.dataArr.splice(index, 1)[0];
    this.dataArr.push(item);

    const position = this.positionArr.splice(index, 1)[0];
    this.positionArr.push(position);
  }

  // Swap the dragged item with the closest item.
  private performSwap(index: number, dropPos: { x: number; y: number }) {
    let closestDistance = Number.MAX_VALUE;
    let closestIndex = -1;

    this.positionArr.forEach((pos, idx) => {
      const distance = Math.sqrt(
        (pos.x - dropPos.x) ** 2 + (pos.y - dropPos.y) ** 2
      );
      if (distance < closestDistance && idx !== index) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== -1) {
      [this.dataArr[index], this.dataArr[closestIndex]] = [
        this.dataArr[closestIndex],
        this.dataArr[index],
      ];

      [this.positionArr[index], this.positionArr[closestIndex]] = [
        this.positionArr[closestIndex],
        this.positionArr[index],
      ];
    }
  }
}
