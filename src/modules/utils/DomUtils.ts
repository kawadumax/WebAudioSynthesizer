import React from "react";

export type Point = { x: number; y: number };
export function containsPoint(rect: DOMRect, point: Point): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function mapToDOMRects(children: HTMLCollection): DOMRect[] {
  return React.Children.map(children, (child, index) => {
    return child[index].getBoundingClientRect();
  });
}

export function splitArray<T>(arr: T[], count: number): [T[], T[]] {
  const firstPart = arr.slice(0, count);
  const secondPart = arr.slice(count);
  return [firstPart, secondPart];
}

export function findRectIndex(
  rects: DOMRect[],
  point: Point
): number | undefined {
  return rects.findIndex((rect) => containsPoint(rect, point));
}

export function findIndexByPoint(
  refs: React.RefObject<SVGGElement>[],
  point: Point
): number {
  // findIndexの返り値は条件を満たさなかった場合、-1、それ以外は当該のindex。
  return refs.findIndex((ref) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) return containsPoint(rect, point);
  });
}
