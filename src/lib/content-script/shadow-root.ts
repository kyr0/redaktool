export const getShadowRoot = () => {
  const host = document.querySelector("ftr-root")
  return host?.shadowRoot;
}
