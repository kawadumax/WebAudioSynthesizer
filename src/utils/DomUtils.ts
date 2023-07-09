export type Point = { x: number; y: number; }
export function containsPoint(rect: DOMRect, point: Point): boolean {
    return point.x >= rect.left && 
           point.x <= rect.right && 
           point.y >= rect.top && 
           point.y <= rect.bottom;
  }