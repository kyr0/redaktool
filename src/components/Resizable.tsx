import React, { useState, useRef, useEffect } from 'react';
import { Resize } from './Icons';

const calculateNewSize = (ref: HTMLElement, deltaX: number, deltaY: number) => {
  const currentSize = getCalulatedSize(ref);
  return {
    w: currentSize.width + deltaX,
    h: currentSize.height + deltaY
  }
}

const applyNewSize = (ref: HTMLElement, width: number, height: number) => {
  ref.style.width = `${width}px`;
  ref.style.height = `${height}px`;
}

export const getCalulatedSize = (ref: HTMLElement) => ({
  width: parseInt(window.getComputedStyle(ref).width, 10),
  height: parseInt(window.getComputedStyle(ref).height, 10)
})

export const Resizable: React.FC<any> = ({ children, onUpdateSize, initialSize, className }) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeButtonRef = useRef<HTMLDivElement>(null);
  const resizableContainerRef = useRef<HTMLDivElement>(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);

  const updatePosition = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resizableContainerRef.current) return;

    const deltaX = e.clientX - lastMousePosition.current.x;
    const deltaY = e.clientY - lastMousePosition.current.y;

    const newSize = calculateNewSize(resizableContainerRef.current, deltaX, deltaY);

    applyNewSize(resizableContainerRef.current, newSize.w, newSize.h);

    lastMousePosition.current = { x: e.clientX, y: e.clientY };

    onUpdateSize(newSize.w, newSize.h);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    lastMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.removeEventListener('mousemove', updatePosition, true);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', updatePosition, true);
      document.addEventListener('mouseup', handleMouseUp, true);
    }

    return () => {
      document.removeEventListener('mousemove', updatePosition, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [isResizing]);

  useEffect(() => {
    if (resizableContainerRef.current && !initialized) {
      applyNewSize(resizableContainerRef.current, initialSize.w, initialSize.h);
      setInitialized(true);
    }
  }, [resizableContainerRef.current, initialized]);

  return (
    <div ref={resizableContainerRef} className={`ab-block`}>
      {children}
      <div ref={resizeButtonRef} onMouseDown={handleMouseDown} className={`ab-block ab-cursor-se-resize ab-absolute -ab-right-1 ab-bottom-0 ab-z-40 ${className}`}>
        <Resize />
      </div>
    </div>
  );
};
