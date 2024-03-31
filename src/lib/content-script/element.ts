export const isElementVisible = (element: HTMLElement | null) => element && element.offsetParent && element.clientHeight > 0 && element.clientWidth > 0;

export const filterForVisibleElements = (elements: Array<HTMLElement | null>) => {
  if (!elements) return [];
  return elements.filter(isElementVisible);
}