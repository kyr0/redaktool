import { useState, useEffect, useRef } from 'react';

export interface Position {
  x: number;
  y: number;
}

export type StyleableElement = HTMLElement | SVGElement;

export interface UpdatePositionCallback {
  (x: number, y: number, node: StyleableElement): void;
}

export const applyNewPosition = (el: StyleableElement, x: number, y: number) => {
    el.style.left = `${x}px`; 
    el.style.top = `${y}px`;
}

export interface DraggableOptions {
  applyTopLeftStyles?: boolean;
  startCentered?: boolean;
  applyTopLeftStylesInitially?: boolean;
  handleSelector?: string;
}

export const defaultDraggableOptions: DraggableOptions = {
    applyTopLeftStyles: true,
    startCentered: false,
    applyTopLeftStylesInitially: true,
};

export const useDraggable = (initialPosition: Position, onUpdatePosition?: UpdatePositionCallback, options: DraggableOptions = defaultDraggableOptions) => {

  // merge, apply, and return the new options
  options = { ...defaultDraggableOptions, ...options };

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(initialPosition.x);
  const [startY, setStartY] = useState<number>(initialPosition.y);
  const draggableRef = useRef<StyleableElement | null>(null);
  const [isInitial, setInitial] = useState<boolean>(true);

  useEffect(() => {
    const node = draggableRef.current
    if (!node) return;

    if (options.applyTopLeftStyles && options.applyTopLeftStylesInitially) {
        applyNewPosition(node, initialPosition.x, initialPosition.y);
    }

    const updatePosition = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const boundingRect = node.getBoundingClientRect();

      const newPosition = {
        x: boundingRect.left + dx,
        y: boundingRect.top + dy,
      };

      if (isInitial && options.startCentered) {
        newPosition.x += (window.innerWidth / 2 ) - (boundingRect.width / 2)
        newPosition.y += (window.innerHeight / 2 ) - (boundingRect.height / 2)
      }

      if (options.applyTopLeftStyles) {
        applyNewPosition(node, newPosition.x, newPosition.y);
      }
      setStartX(e.clientX);
      setStartY(e.clientY);

      onUpdatePosition?.(newPosition.x, newPosition.y, node);

      setInitial(false)
    };

    const handleMouseDown = (e: MouseEvent) => {

      if (options.handleSelector) {
        const target = e.target as Element;
        const dragHandleEl = node.querySelector(options.handleSelector);
        if (!dragHandleEl || !dragHandleEl.contains(target)) return;
      }

      setIsDragging(true);
      setStartX(e.clientX);
      setStartY(e.clientY);
      node.classList.add('opacity-80');
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        node.classList.remove('opacity-80');
        document.removeEventListener('mousemove', updatePosition);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', updatePosition);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Event listeners for mouse down to start dragging
    node.addEventListener('mousedown', handleMouseDown as any);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseup', handleMouseUp);
      node.removeEventListener('mousedown', handleMouseDown as any);
    };
  }, [draggableRef.current, isInitial, options.applyTopLeftStyles, options.applyTopLeftStylesInitially, isDragging, startX, startY, onUpdatePosition]);

  return draggableRef;
};

export default useDraggable;
