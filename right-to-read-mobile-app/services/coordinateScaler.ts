export interface PageSize {
  width: number;
  height: number;
}

export interface BoundingBox {
  topLeft: [number, number];
  bottomRight: [number, number];
}

export class CoordinateScaler {
  private scaleX: number;
  private scaleY: number;

  constructor(originalPageSize: PageSize, currentPageSize: PageSize) {
    this.scaleX = currentPageSize.width / originalPageSize.width;
    this.scaleY = currentPageSize.height / originalPageSize.height;
    
    console.log(`Coordinate scaling: ${originalPageSize.width}x${originalPageSize.height} -> ${currentPageSize.width}x${currentPageSize.height}`);
    console.log(`Scale factors: X=${this.scaleX.toFixed(3)}, Y=${this.scaleY.toFixed(3)}`);
  }

  scaleCoordinates(boundingBox: number[][]): BoundingBox {
    const [[x0, y0], [x1, y1]] = boundingBox;
    
    const scaledBox: BoundingBox = {
      topLeft: [x0 * this.scaleX, y0 * this.scaleY],
      bottomRight: [x1 * this.scaleX, y1 * this.scaleY]
    };
    
    return scaledBox;
  }

  scalePoint(x: number, y: number): [number, number] {
    return [x * this.scaleX, y * this.scaleY];
  }

  getScaleFactors(): { scaleX: number; scaleY: number } {
    return { scaleX: this.scaleX, scaleY: this.scaleY };
  }

  // Convert absolute coordinates to percentages (Solution 2 as backup)
  static convertToPercentages(boundingBox: number[][], pageSize: PageSize): number[][] {
    const [[x0, y0], [x1, y1]] = boundingBox;
    return [
      [(x0 / pageSize.width) * 100, (y0 / pageSize.height) * 100],
      [(x1 / pageSize.width) * 100, (y1 / pageSize.height) * 100]
    ];
  }

  // Apply percentage coordinates to any size (Solution 2 as backup)
  static applyPercentageCoordinates(percentBox: number[][], currentSize: PageSize): BoundingBox {
    const [[x0Pct, y0Pct], [x1Pct, y1Pct]] = percentBox;
    return {
      topLeft: [(x0Pct * currentSize.width) / 100, (y0Pct * currentSize.height) / 100],
      bottomRight: [(x1Pct * currentSize.width) / 100, (y1Pct * currentSize.height) / 100]
    };
  }
}
