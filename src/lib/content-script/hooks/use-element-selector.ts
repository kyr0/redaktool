import { useCallback, useState } from 'react';
import { elementSelectionAtom } from '../stores/use-element-selector';

export const useElementSelector = (onSelectElement: (element: HTMLElement) => void): (() => void) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const originalStyles = new Map<HTMLElement, { backgroundColor: string; border: string; cursor: string }>();
  let closestHighlightedElement: HTMLElement | null = null;

  const restoreOriginalStyle = useCallback((element: HTMLElement) => {
    // Using attributes to store and restore original styles
    element.style.backgroundColor = element.getAttribute('data-original-background-color') || '';
    element.style.border = element.getAttribute('data-original-border') || '';
    element.style.cursor = element.getAttribute('data-original-cursor') || '';
    originalStyles.delete(element); // Remove the element from the map after restoring its style
  }, [originalStyles]);

  const stopSelecting = useCallback(() => {
    setIsSelecting(false);
    document.removeEventListener('mousemove', highlightElement);
    document.removeEventListener('click', selectElement);
    requestAnimationFrame(() => {
      originalStyles.forEach((_, element) => restoreOriginalStyle(element));
    });
    originalStyles.clear(); // Clear the map after restoring styles
    closestHighlightedElement = null; // Reset the closest highlighted element
  }, [originalStyles, restoreOriginalStyle]);

  const highlightElement = useCallback((event: MouseEvent) => {
    let target = event.target as HTMLElement;

    // Clear any previous highlights
    if (closestHighlightedElement && closestHighlightedElement !== target) {
      restoreOriginalStyle(closestHighlightedElement);
    }

    if (!originalStyles.has(target)) {
      // Store the current styles in attributes before changing them
      target.setAttribute('data-original-background-color', target.style.backgroundColor);
      target.setAttribute('data-original-border', target.style.border);
      target.setAttribute('data-original-cursor', target.style.cursor);
      
      originalStyles.set(target, {
        backgroundColor: target.style.backgroundColor,
        border: target.style.border,
        cursor: target.style.cursor,
      });
      
      target.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
      target.style.border = '2px dashed #cc0000';
      target.style.cursor = 'crosshair';
      closestHighlightedElement = target;

      const removeHighlight = () => {
        if (closestHighlightedElement === target) {
          restoreOriginalStyle(target);
          closestHighlightedElement = null;
        }
      };
      target.addEventListener('mouseleave', removeHighlight, { once: true });
    }
  }, [originalStyles, restoreOriginalStyle, closestHighlightedElement]);

  const selectElement = useCallback((event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    onSelectElement(target);
    // Temporarily apply the selection style
    target.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    target.style.border = '2px solid #cc0000';
    target.style.cursor = 'crosshair';
    elementSelectionAtom.set(target);

    // Reset the style after 1 second
    setTimeout(() => {
      restoreOriginalStyle(target); // Restore the original style
    }, 2500); // 1 second delay

    stopSelecting();
  }, [onSelectElement, stopSelecting, restoreOriginalStyle]);

  const startSelecting = useCallback(() => {
    if (!isSelecting) {
      setIsSelecting(true);
      document.addEventListener('mousemove', highlightElement);
      document.addEventListener('click', selectElement);
    }
  }, [isSelecting, highlightElement, selectElement]);

  return () => {
    // Prevent selecting the button itself (inspector activation button)
    setTimeout(startSelecting, 100);
  };
};
