import { p as prefPerPage } from "./prefs-rFs1yf0W.js";
import "./utils-BHy2C4E0.js";
function isElement(input) {
  return typeof input === "object" && input !== null && input.nodeType === Node.ELEMENT_NODE;
}
const OPERATOR = {
  NONE: "",
  DESCENDANT: " ",
  CHILD: " > "
};
const CSS_SELECTOR_TYPE = {
  id: "id",
  class: "class",
  tag: "tag",
  attribute: "attribute",
  nthchild: "nthchild",
  nthoftype: "nthoftype"
};
function isEnumValue(haystack, needle) {
  return Object.values(haystack).includes(needle);
}
const libraryName = "CssSelectorGenerator";
function showWarning(id = "unknown problem", ...args) {
  console.warn(`${libraryName}: ${id}`, ...args);
}
const DEFAULT_OPTIONS = {
  selectors: [
    CSS_SELECTOR_TYPE.id,
    CSS_SELECTOR_TYPE.class,
    CSS_SELECTOR_TYPE.tag,
    CSS_SELECTOR_TYPE.attribute
  ],
  // if set to true, always include tag name
  includeTag: false,
  whitelist: [],
  blacklist: [],
  combineWithinSelector: true,
  combineBetweenSelectors: true,
  root: null,
  maxCombinations: Number.POSITIVE_INFINITY,
  maxCandidates: Number.POSITIVE_INFINITY
};
function sanitizeSelectorTypes(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter((item) => isEnumValue(CSS_SELECTOR_TYPE, item));
}
function isRegExp(input) {
  return input instanceof RegExp;
}
function isCssSelectorMatch(input) {
  return ["string", "function"].includes(typeof input) || isRegExp(input);
}
function sanitizeCssSelectorMatchList(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.filter(isCssSelectorMatch);
}
function isNode(input) {
  return input instanceof Node;
}
function isParentNode(input) {
  const validParentNodeTypes = [
    Node.DOCUMENT_NODE,
    Node.DOCUMENT_FRAGMENT_NODE,
    // this includes Shadow DOM root
    Node.ELEMENT_NODE
  ];
  return isNode(input) && validParentNodeTypes.includes(input.nodeType);
}
function sanitizeRoot(input, element) {
  if (isParentNode(input)) {
    if (!input.contains(element)) {
      showWarning("element root mismatch", "Provided root does not contain the element. This will most likely result in producing a fallback selector using element's real root node. If you plan to use the selector using provided root (e.g. `root.querySelector`), it will nto work as intended.");
    }
    return input;
  }
  const rootNode = element.getRootNode({ composed: false });
  if (isParentNode(rootNode)) {
    if (rootNode !== document) {
      showWarning("shadow root inferred", "You did not provide a root and the element is a child of Shadow DOM. This will produce a selector using ShadowRoot as a root. If you plan to use the selector using document as a root (e.g. `document.querySelector`), it will not work as intended.");
    }
    return rootNode;
  }
  return element.ownerDocument.querySelector(":root");
}
function sanitizeMaxNumber(input) {
  return typeof input === "number" ? input : Number.POSITIVE_INFINITY;
}
function sanitizeOptions(element, custom_options = {}) {
  const options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), custom_options);
  return {
    selectors: sanitizeSelectorTypes(options.selectors),
    whitelist: sanitizeCssSelectorMatchList(options.whitelist),
    blacklist: sanitizeCssSelectorMatchList(options.blacklist),
    root: sanitizeRoot(options.root, element),
    combineWithinSelector: !!options.combineWithinSelector,
    combineBetweenSelectors: !!options.combineBetweenSelectors,
    includeTag: !!options.includeTag,
    maxCombinations: sanitizeMaxNumber(options.maxCombinations),
    maxCandidates: sanitizeMaxNumber(options.maxCandidates)
  };
}
function getIntersection(items = []) {
  const [firstItem = [], ...otherItems] = items;
  if (otherItems.length === 0) {
    return firstItem;
  }
  return otherItems.reduce((accumulator, currentValue) => {
    return accumulator.filter((item) => currentValue.includes(item));
  }, firstItem);
}
function flattenArray(input) {
  return [].concat(...input);
}
function wildcardToRegExp(input) {
  return input.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".+");
}
function createPatternMatcher(list) {
  const matchFunctions = list.map((item) => {
    if (isRegExp(item)) {
      return (input) => item.test(input);
    }
    if (typeof item === "function") {
      return (input) => {
        const result = item(input);
        if (typeof result !== "boolean") {
          showWarning("pattern matcher function invalid", "Provided pattern matching function does not return boolean. It's result will be ignored.", item);
          return false;
        }
        return result;
      };
    }
    if (typeof item === "string") {
      const re = new RegExp("^" + wildcardToRegExp(item) + "$");
      return (input) => re.test(input);
    }
    showWarning("pattern matcher invalid", "Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.", item);
    return () => false;
  });
  return (input) => matchFunctions.some((matchFunction) => matchFunction(input));
}
function testSelector(elements, selector, root) {
  const result = Array.from(sanitizeRoot(root, elements[0]).querySelectorAll(selector));
  return result.length === elements.length && elements.every((element) => result.includes(element));
}
function getElementParents(element, root) {
  root = root !== null && root !== void 0 ? root : getRootNode(element);
  const result = [];
  let parent = element;
  while (isElement(parent) && parent !== root) {
    result.push(parent);
    parent = parent.parentElement;
  }
  return result;
}
function getParents(elements, root) {
  return getIntersection(elements.map((element) => getElementParents(element, root)));
}
function getRootNode(element) {
  return element.ownerDocument.querySelector(":root");
}
const SELECTOR_SEPARATOR = ", ";
const INVALID_ID_RE = new RegExp([
  "^$",
  // empty or not set
  "\\s"
  // contains whitespace
].join("|"));
const INVALID_CLASS_RE = new RegExp([
  "^$"
  // empty or not set
].join("|"));
const SELECTOR_PATTERN = [
  CSS_SELECTOR_TYPE.nthoftype,
  CSS_SELECTOR_TYPE.tag,
  CSS_SELECTOR_TYPE.id,
  CSS_SELECTOR_TYPE.class,
  CSS_SELECTOR_TYPE.attribute,
  CSS_SELECTOR_TYPE.nthchild
];
const attributeBlacklistMatch = createPatternMatcher([
  "class",
  "id",
  // Angular attributes
  "ng-*"
]);
function attributeNodeToSimplifiedSelector({ name }) {
  return `[${name}]`;
}
function attributeNodeToSelector({ name, value }) {
  return `[${name}='${value}']`;
}
function isValidAttributeNode({ nodeName }, element) {
  const tagName = element.tagName.toLowerCase();
  if (["input", "option"].includes(tagName) && nodeName === "value") {
    return false;
  }
  return !attributeBlacklistMatch(nodeName);
}
function sanitizeAttributeData({ nodeName, nodeValue }) {
  return {
    name: sanitizeSelectorItem(nodeName),
    value: sanitizeSelectorItem(nodeValue)
  };
}
function getElementAttributeSelectors(element) {
  const validAttributes = Array.from(element.attributes).filter((attributeNode) => isValidAttributeNode(attributeNode, element)).map(sanitizeAttributeData);
  return [
    ...validAttributes.map(attributeNodeToSimplifiedSelector),
    ...validAttributes.map(attributeNodeToSelector)
  ];
}
function getAttributeSelectors(elements) {
  const elementSelectors = elements.map(getElementAttributeSelectors);
  return getIntersection(elementSelectors);
}
function getElementClassSelectors(element) {
  return (element.getAttribute("class") || "").trim().split(/\s+/).filter((item) => !INVALID_CLASS_RE.test(item)).map((item) => `.${sanitizeSelectorItem(item)}`);
}
function getClassSelectors(elements) {
  const elementSelectors = elements.map(getElementClassSelectors);
  return getIntersection(elementSelectors);
}
function getElementIdSelectors(element) {
  const id = element.getAttribute("id") || "";
  const selector = `#${sanitizeSelectorItem(id)}`;
  const rootNode = element.getRootNode({ composed: false });
  return !INVALID_ID_RE.test(id) && testSelector([element], selector, rootNode) ? [selector] : [];
}
function getIdSelector(elements) {
  return elements.length === 0 || elements.length > 1 ? [] : getElementIdSelectors(elements[0]);
}
function getElementNthChildSelector(element) {
  const parent = element.parentNode;
  if (parent) {
    const siblings = Array.from(parent.childNodes).filter(isElement);
    const elementIndex = siblings.indexOf(element);
    if (elementIndex > -1) {
      return [`:nth-child(${elementIndex + 1})`];
    }
  }
  return [];
}
function getNthChildSelector(elements) {
  return getIntersection(elements.map(getElementNthChildSelector));
}
function getElementTagSelectors(element) {
  return [
    sanitizeSelectorItem(element.tagName.toLowerCase())
  ];
}
function getTagSelector(elements) {
  const selectors = [
    ...new Set(flattenArray(elements.map(getElementTagSelectors)))
  ];
  return selectors.length === 0 || selectors.length > 1 ? [] : [selectors[0]];
}
function getElementNthOfTypeSelector(element) {
  const tag = getTagSelector([element])[0];
  const parentElement = element.parentElement;
  if (parentElement) {
    const siblings = Array.from(parentElement.children).filter((element2) => element2.tagName.toLowerCase() === tag);
    const elementIndex = siblings.indexOf(element);
    if (elementIndex > -1) {
      return [
        `${tag}:nth-of-type(${elementIndex + 1})`
      ];
    }
  }
  return [];
}
function getNthOfTypeSelector(elements) {
  return getIntersection(elements.map(getElementNthOfTypeSelector));
}
function* powerSetGenerator(input = [], { maxResults = Number.POSITIVE_INFINITY } = {}) {
  let resultCounter = 0;
  let offsets = generateOffsets(1);
  while (offsets.length <= input.length && resultCounter < maxResults) {
    resultCounter += 1;
    const result = offsets.map((offset) => input[offset]);
    yield result;
    offsets = bumpOffsets(offsets, input.length - 1);
  }
}
function getPowerSet(input = [], { maxResults = Number.POSITIVE_INFINITY } = {}) {
  return Array.from(powerSetGenerator(input, { maxResults }));
}
function bumpOffsets(offsets = [], maxValue = 0) {
  const size = offsets.length;
  if (size === 0) {
    return [];
  }
  const result = [...offsets];
  result[size - 1] += 1;
  for (let index = size - 1; index >= 0; index--) {
    if (result[index] > maxValue) {
      if (index === 0) {
        return generateOffsets(size + 1);
      } else {
        result[index - 1]++;
        result[index] = result[index - 1] + 1;
      }
    }
  }
  if (result[size - 1] > maxValue) {
    return generateOffsets(size + 1);
  }
  return result;
}
function generateOffsets(size = 1) {
  return Array.from(Array(size).keys());
}
function getCartesianProduct(input = {}) {
  let result = [];
  Object.entries(input).forEach(([key, values]) => {
    result = values.flatMap((value) => {
      if (result.length === 0) {
        return [{ [key]: value }];
      } else {
        return result.map((memo) => Object.assign(Object.assign({}, memo), { [key]: value }));
      }
    });
  });
  return result;
}
const ESCAPED_COLON = ":".charCodeAt(0).toString(16).toUpperCase();
const SPECIAL_CHARACTERS_RE = /[ !"#$%&'()\[\]{|}<>*+,./;=?@^`~\\]/;
function sanitizeSelectorItem(input = "") {
  var _a, _b;
  return (_b = (_a = CSS === null || CSS === void 0 ? void 0 : CSS.escape) === null || _a === void 0 ? void 0 : _a.call(CSS, input)) !== null && _b !== void 0 ? _b : legacySanitizeSelectorItem(input);
}
function legacySanitizeSelectorItem(input = "") {
  return input.split("").map((character) => {
    if (character === ":") {
      return `\\${ESCAPED_COLON} `;
    }
    if (SPECIAL_CHARACTERS_RE.test(character)) {
      return `\\${character}`;
    }
    return escape(character).replace(/%/g, "\\");
  }).join("");
}
const SELECTOR_TYPE_GETTERS = {
  tag: getTagSelector,
  id: getIdSelector,
  class: getClassSelectors,
  attribute: getAttributeSelectors,
  nthchild: getNthChildSelector,
  nthoftype: getNthOfTypeSelector
};
const ELEMENT_SELECTOR_TYPE_GETTERS = {
  tag: getElementTagSelectors,
  id: getElementIdSelectors,
  class: getElementClassSelectors,
  attribute: getElementAttributeSelectors,
  nthchild: getElementNthChildSelector,
  nthoftype: getElementNthOfTypeSelector
};
function getElementSelectorsByType(element, selectorType) {
  return ELEMENT_SELECTOR_TYPE_GETTERS[selectorType](element);
}
function getSelectorsByType(elements, selector_type) {
  var _a;
  const getter = (_a = SELECTOR_TYPE_GETTERS[selector_type]) !== null && _a !== void 0 ? _a : () => [];
  return getter(elements);
}
function filterSelectors(list = [], matchBlacklist, matchWhitelist) {
  return list.filter((item) => matchWhitelist(item) || !matchBlacklist(item));
}
function orderSelectors(list = [], matchWhitelist) {
  return list.sort((a, b) => {
    const a_is_whitelisted = matchWhitelist(a);
    const b_is_whitelisted = matchWhitelist(b);
    if (a_is_whitelisted && !b_is_whitelisted) {
      return -1;
    }
    if (!a_is_whitelisted && b_is_whitelisted) {
      return 1;
    }
    return 0;
  });
}
function getAllSelectors(elements, root, options) {
  const selectors_list = getSelectorsList(elements, options);
  const type_combinations = getTypeCombinations(selectors_list, options);
  const all_selectors = flattenArray(type_combinations);
  return [...new Set(all_selectors)];
}
function getSelectorsList(elements, options) {
  const { blacklist, whitelist, combineWithinSelector, maxCombinations } = options;
  const matchBlacklist = createPatternMatcher(blacklist);
  const matchWhitelist = createPatternMatcher(whitelist);
  const reducer = (data, selector_type) => {
    const selectors_by_type = getSelectorsByType(elements, selector_type);
    const filtered_selectors = filterSelectors(selectors_by_type, matchBlacklist, matchWhitelist);
    const found_selectors = orderSelectors(filtered_selectors, matchWhitelist);
    data[selector_type] = combineWithinSelector ? getPowerSet(found_selectors, { maxResults: maxCombinations }) : found_selectors.map((item) => [item]);
    return data;
  };
  return getSelectorsToGet(options).reduce(reducer, {});
}
function getSelectorsToGet(options) {
  const { selectors, includeTag } = options;
  const selectors_to_get = [].concat(selectors);
  if (includeTag && !selectors_to_get.includes("tag")) {
    selectors_to_get.push("tag");
  }
  return selectors_to_get;
}
function addTagTypeIfNeeded(list) {
  return list.includes(CSS_SELECTOR_TYPE.tag) || list.includes(CSS_SELECTOR_TYPE.nthoftype) ? [...list] : [...list, CSS_SELECTOR_TYPE.tag];
}
function combineSelectorTypes(options) {
  const { selectors, combineBetweenSelectors, includeTag, maxCandidates } = options;
  const combinations = combineBetweenSelectors ? getPowerSet(selectors, { maxResults: maxCandidates }) : selectors.map((item) => [item]);
  return includeTag ? combinations.map(addTagTypeIfNeeded) : combinations;
}
function getTypeCombinations(selectors_list, options) {
  return combineSelectorTypes(options).map((item) => {
    return constructSelectors(item, selectors_list);
  }).filter((item) => item.length > 0);
}
function constructSelectors(selector_types, selectors_by_type) {
  const data = {};
  selector_types.forEach((selector_type) => {
    const selector_variants = selectors_by_type[selector_type];
    if (selector_variants.length > 0) {
      data[selector_type] = selector_variants;
    }
  });
  const combinations = getCartesianProduct(data);
  return combinations.map(constructSelector);
}
function constructSelectorType(selector_type, selectors_data) {
  return selectors_data[selector_type] ? selectors_data[selector_type].join("") : "";
}
function constructSelector(selectorData = {}) {
  const pattern = [...SELECTOR_PATTERN];
  if (selectorData[CSS_SELECTOR_TYPE.tag] && selectorData[CSS_SELECTOR_TYPE.nthoftype]) {
    pattern.splice(pattern.indexOf(CSS_SELECTOR_TYPE.tag), 1);
  }
  return pattern.map((type) => constructSelectorType(type, selectorData)).join("");
}
function generateCandidateCombinations(selectors, rootSelector) {
  return [
    ...selectors.map((selector) => rootSelector + OPERATOR.DESCENDANT + selector),
    ...selectors.map((selector) => rootSelector + OPERATOR.CHILD + selector)
  ];
}
function generateCandidates(selectors, rootSelector) {
  return rootSelector === "" ? selectors : generateCandidateCombinations(selectors, rootSelector);
}
function getSelectorWithinRoot(elements, root, rootSelector = "", options) {
  const elementSelectors = getAllSelectors(elements, options.root, options);
  const selectorCandidates = generateCandidates(elementSelectors, rootSelector);
  for (const candidateSelector of selectorCandidates) {
    if (testSelector(elements, candidateSelector, options.root)) {
      return candidateSelector;
    }
  }
  return null;
}
function getClosestIdentifiableParent(elements, root, rootSelector = "", options) {
  if (elements.length === 0) {
    return null;
  }
  const candidatesList = [
    elements.length > 1 ? elements : [],
    ...getParents(elements, root).map((element) => [element])
  ];
  for (const currentElements of candidatesList) {
    const result = getSelectorWithinRoot(currentElements, root, rootSelector, options);
    if (result) {
      return {
        foundElements: currentElements,
        selector: result
      };
    }
  }
  return null;
}
function sanitizeSelectorNeedle(needle) {
  if (needle instanceof NodeList || needle instanceof HTMLCollection) {
    needle = Array.from(needle);
  }
  const elements = (Array.isArray(needle) ? needle : [needle]).filter(isElement);
  return [...new Set(elements)];
}
function createElementSelectorData(selector) {
  return {
    value: selector,
    include: false
  };
}
function createElementData(element, selectorTypes, operator = OPERATOR.NONE) {
  const selectors = {};
  selectorTypes.forEach((selectorType) => {
    Reflect.set(selectors, selectorType, getElementSelectorsByType(element, selectorType).map(createElementSelectorData));
  });
  return {
    element,
    operator,
    selectors
  };
}
function constructElementSelector({ selectors, operator }) {
  let pattern = [...SELECTOR_PATTERN];
  if (selectors[CSS_SELECTOR_TYPE.tag] && selectors[CSS_SELECTOR_TYPE.nthoftype]) {
    pattern = pattern.filter((item) => item !== CSS_SELECTOR_TYPE.tag);
  }
  let selector = "";
  pattern.forEach((selectorType) => {
    const selectorsOfType = selectors[selectorType] || [];
    selectorsOfType.forEach(({ value, include }) => {
      if (include) {
        selector += value;
      }
    });
  });
  return operator + selector;
}
function getElementFallbackSelector(element) {
  const parentElements = getElementParents(element).reverse();
  const elementsData = parentElements.map((element2) => {
    const elementData = createElementData(element2, [CSS_SELECTOR_TYPE.nthchild], OPERATOR.CHILD);
    elementData.selectors.nthchild.forEach((selectorData) => {
      selectorData.include = true;
    });
    return elementData;
  });
  return [":root", ...elementsData.map(constructElementSelector)].join("");
}
function getFallbackSelector(elements) {
  return elements.map(getElementFallbackSelector).join(SELECTOR_SEPARATOR);
}
function getCssSelector(needle, custom_options = {}) {
  const elements = sanitizeSelectorNeedle(needle);
  const options = sanitizeOptions(elements[0], custom_options);
  let partialSelector = "";
  let currentRoot = options.root;
  function updateIdentifiableParent() {
    return getClosestIdentifiableParent(elements, currentRoot, partialSelector, options);
  }
  let closestIdentifiableParent = updateIdentifiableParent();
  while (closestIdentifiableParent) {
    const { foundElements, selector } = closestIdentifiableParent;
    if (testSelector(elements, selector, options.root)) {
      return selector;
    }
    currentRoot = foundElements[0];
    partialSelector = selector;
    closestIdentifiableParent = updateIdentifiableParent();
  }
  if (elements.length > 1) {
    return elements.map((element) => getCssSelector(element, options)).join(SELECTOR_SEPARATOR);
  }
  return getFallbackSelector(elements);
}
const init = () => {
  if (document.body && !document.body.$$_ftrEventListenersMap) {
    document.body.$$_ftrEventListenersMap = /* @__PURE__ */ new Map();
  }
  if (document.body && !document.body.$$_ftrMediaElements) {
    document.body.$$_ftrMediaElements = [];
  }
};
const broadcastMediaElementSelectors = () => {
  prefPerPage("mediaElements", []).set(
    document.body.$$_ftrMediaElements
  );
};
document.addEventListener("DOMContentLoaded", () => {
  init();
  document.querySelectorAll("audio, video").forEach((element) => {
    document.body.$$_ftrMediaElements.push(
      getCssSelector(element)
    );
  });
  broadcastMediaElementSelectors();
  const handleMutations = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLAudioElement || node instanceof HTMLVideoElement) {
            console.log(
              `${node instanceof HTMLAudioElement ? "audio" : "video"} appended`,
              node
            );
            document.body.$$_ftrMediaElements.push(
              getCssSelector(node)
            );
            broadcastMediaElementSelectors();
          }
        });
      }
    }
  };
  const observer = new MutationObserver(handleMutations);
  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLXByZWhvb2sudHMtN09xbnpPdEsuanMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy91dGlsaXRpZXMtaXNlbGVtZW50LnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1zZWxlY3Rvci1nZW5lcmF0b3Ivc3JjL3R5cGVzLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1zZWxlY3Rvci1nZW5lcmF0b3Ivc3JjL3V0aWxpdGllcy10eXBlc2NyaXB0LnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1zZWxlY3Rvci1nZW5lcmF0b3Ivc3JjL3V0aWxpdGllcy1tZXNzYWdlcy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy91dGlsaXRpZXMtb3B0aW9ucy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy91dGlsaXRpZXMtZGF0YS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy91dGlsaXRpZXMtZG9tLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1zZWxlY3Rvci1nZW5lcmF0b3Ivc3JjL2NvbnN0YW50cy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy9zZWxlY3Rvci1hdHRyaWJ1dGUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLXNlbGVjdG9yLWdlbmVyYXRvci9zcmMvc2VsZWN0b3ItY2xhc3MudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLXNlbGVjdG9yLWdlbmVyYXRvci9zcmMvc2VsZWN0b3ItaWQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLXNlbGVjdG9yLWdlbmVyYXRvci9zcmMvc2VsZWN0b3ItbnRoLWNoaWxkLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1zZWxlY3Rvci1nZW5lcmF0b3Ivc3JjL3NlbGVjdG9yLXRhZy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy9zZWxlY3Rvci1udGgtb2YtdHlwZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy91dGlsaXRpZXMtcG93ZXJzZXQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLXNlbGVjdG9yLWdlbmVyYXRvci9zcmMvdXRpbGl0aWVzLWNhcnRlc2lhbi50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yL3NyYy91dGlsaXRpZXMtc2VsZWN0b3JzLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1zZWxlY3Rvci1nZW5lcmF0b3Ivc3JjL3V0aWxpdGllcy1lbGVtZW50LWRhdGEudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLXNlbGVjdG9yLWdlbmVyYXRvci9zcmMvc2VsZWN0b3ItZmFsbGJhY2sudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLXNlbGVjdG9yLWdlbmVyYXRvci9zcmMvaW5kZXgudHMiLCIuLi8uLi9zcmMvZXZlbnRzLXByZWhvb2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBHdWFyZCBmdW5jdGlvbiB0aGF0IGNoZWNrcyBpZiBwcm92aWRlZCBgaW5wdXRgIGlzIGFuIEVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnQoaW5wdXQ6IHVua25vd24pOiBpbnB1dCBpcyBFbGVtZW50IHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgaW5wdXQgPT09IFwib2JqZWN0XCIgJiZcbiAgICBpbnB1dCAhPT0gbnVsbCAmJlxuICAgIChpbnB1dCBhcyBFbGVtZW50KS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREVcbiAgKTtcbn1cbiIsImRlY2xhcmUgY29uc3Qgb3BhcXVlSWQ6IHVuaXF1ZSBzeW1ib2w7XG5cbmRlY2xhcmUgdHlwZSBUYWdnZWQ8VG9rZW4+ID0ge1xuICByZWFkb25seSBbb3BhcXVlSWRdOiBUb2tlbjtcbn07XG5cbmV4cG9ydCB0eXBlIE9wYXF1ZTxUeXBlLCBUb2tlbiA9IHVua25vd24+ID0gVHlwZSAmIFRhZ2dlZDxUb2tlbj47XG5cbmV4cG9ydCB0eXBlIE9iamVjdFZhbHVlczxUPiA9IFRba2V5b2YgVF07XG5cbi8vIFRPRE8gcmVuYW1lIHRvIFwiQ3NzU2VsZWN0b3JcIlxuZXhwb3J0IHR5cGUgQ3NzU2VsZWN0b3JHZW5lcmF0ZWQgPSBPcGFxdWU8c3RyaW5nLCBcIkNzc1NlbGVjdG9yXCI+O1xuXG5leHBvcnQgY29uc3QgT1BFUkFUT1IgPSB7XG4gIE5PTkU6IFwiXCIsXG4gIERFU0NFTkRBTlQ6IFwiIFwiLFxuICBDSElMRDogXCIgPiBcIixcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIE9wZXJhdG9yVmFsdWUgPSBPYmplY3RWYWx1ZXM8dHlwZW9mIE9QRVJBVE9SPjtcblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50U2VsZWN0b3JEYXRhIHtcbiAgdmFsdWU6IENzc1NlbGVjdG9yR2VuZXJhdGVkO1xuICBpbmNsdWRlOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVsZW1lbnREYXRhIHtcbiAgZWxlbWVudDogRWxlbWVudDtcbiAgb3BlcmF0b3I6IE9wZXJhdG9yVmFsdWU7XG4gIHNlbGVjdG9yczogUGFydGlhbDxSZWNvcmQ8Q3NzU2VsZWN0b3JUeXBlLCBFbGVtZW50U2VsZWN0b3JEYXRhW10+Pjtcbn1cblxuZXhwb3J0IHR5cGUgQ3NzU2VsZWN0b3IgPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBDc3NTZWxlY3RvcnMgPSBBcnJheTxDc3NTZWxlY3Rvcj47XG5cbnR5cGUgQ3NzU2VsZWN0b3JNYXRjaEZuID0gKGlucHV0OiBzdHJpbmcpID0+IGJvb2xlYW47XG5leHBvcnQgdHlwZSBDc3NTZWxlY3Rvck1hdGNoID0gUmVnRXhwIHwgc3RyaW5nIHwgQ3NzU2VsZWN0b3JNYXRjaEZuO1xuXG5leHBvcnQgY29uc3QgQ1NTX1NFTEVDVE9SX1RZUEUgPSB7XG4gIGlkOiBcImlkXCIsXG4gIGNsYXNzOiBcImNsYXNzXCIsXG4gIHRhZzogXCJ0YWdcIixcbiAgYXR0cmlidXRlOiBcImF0dHJpYnV0ZVwiLFxuICBudGhjaGlsZDogXCJudGhjaGlsZFwiLFxuICBudGhvZnR5cGU6IFwibnRob2Z0eXBlXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBDc3NTZWxlY3RvclR5cGUgPSBPYmplY3RWYWx1ZXM8dHlwZW9mIENTU19TRUxFQ1RPUl9UWVBFPjtcblxuLy8gZXhwb3J0IGVudW0gQ3NzU2VsZWN0b3JUeXBlIHtcbi8vICAgaWQgPSBcImlkXCIsXG4vLyAgIGNsYXNzID0gXCJjbGFzc1wiLFxuLy8gICB0YWcgPSBcInRhZ1wiLFxuLy8gICBhdHRyaWJ1dGUgPSBcImF0dHJpYnV0ZVwiLFxuLy8gICBudGhjaGlsZCA9IFwibnRoY2hpbGRcIixcbi8vICAgbnRob2Z0eXBlID0gXCJudGhvZnR5cGVcIixcbi8vIH1cblxuZXhwb3J0IHR5cGUgQ3NzU2VsZWN0b3JUeXBlcyA9IEFycmF5PENzc1NlbGVjdG9yVHlwZT47XG5cbmV4cG9ydCB0eXBlIENzc1NlbGVjdG9yc0J5VHlwZSA9IFBhcnRpYWw8UmVjb3JkPENzc1NlbGVjdG9yVHlwZSwgQ3NzU2VsZWN0b3JzPj47XG5cbmV4cG9ydCB0eXBlIENzc1NlbGVjdG9yRGF0YSA9IHtcbiAgW2tleSBpbiBDc3NTZWxlY3RvclR5cGVdPzogQXJyYXk8c3RyaW5nPiB8IEFycmF5PEFycmF5PHN0cmluZz4+O1xufTtcblxuZXhwb3J0IHR5cGUgQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zSW5wdXQgPSBQYXJ0aWFsPHtcbiAgLy8gTGlzdCBvZiBzZWxlY3RvciB0eXBlcyB0byB1c2UuIFRoZXkgd2lsbCBiZSBwcmlvcml0aXNlZCBieSB0aGVpciBvcmRlci5cbiAgc2VsZWN0b3JzOiBDc3NTZWxlY3RvclR5cGVbXTtcbiAgLy8gTGlzdCBvZiBzZWxlY3RvcnMgdGhhdCBzaG91bGQgYmUgcHJpb3JpdGlzZWQuXG4gIHdoaXRlbGlzdDogQXJyYXk8Q3NzU2VsZWN0b3JNYXRjaD47XG4gIC8vIExpc3Qgb2Ygc2VsZWN0b3JzIHRoYXQgc2hvdWxkIGJlIGlnbm9yZWQuXG4gIGJsYWNrbGlzdDogQXJyYXk8Q3NzU2VsZWN0b3JNYXRjaD47XG4gIC8vIFJvb3QgZWxlbWVudCBpbnNpZGUgd2hpY2ggdGhlIHNlbGVjdG9yIHdpbGwgYmUgZ2VuZXJhdGVkLiBJZiBub3Qgc2V0LCB0aGUgZG9jdW1lbnQgcm9vdCB3aWxsIGJlIHVzZWQuXG4gIHJvb3Q6IFBhcmVudE5vZGUgfCBudWxsO1xuICAvLyBJZiBzZXQgdG8gYHRydWVgLCB0aGUgZ2VuZXJhdG9yIHdpbGwgdGVzdCBjb21iaW5hdGlvbnMgb2Ygc2VsZWN0b3JzIG9mIHNpbmdsZSB0eXBlIChlLmcuIG11bHRpcGxlIGNsYXNzIHNlbGVjdG9ycykuXG4gIGNvbWJpbmVXaXRoaW5TZWxlY3RvcjogYm9vbGVhbjtcbiAgLy8gSWYgc2V0IHRvIGB0cnVlYCwgdGhlIGdlbmVyYXRvciB3aWxsIHRyeSB0byB0ZXN0IGNvbWJpbmF0aW9ucyBvZiBzZWxlY3RvcnMgb2YgZGlmZmVyZW50IHR5cGVzIChlLmcuIHRhZyArIGNsYXNzIG5hbWUpLlxuICBjb21iaW5lQmV0d2VlblNlbGVjdG9yczogYm9vbGVhbjtcbiAgLy8gSWYgc2V0IHRvIGB0cnVlYCwgYWxsIGdlbmVyYXRlZCBzZWxlY3RvcnMgd2lsbCBpbmNsdWRlIHRoZSBUQUcgcGFydC4gRXZlbiBpZiB0YWcgc2VsZWN0b3IgdHlwZSBpcyBub3QgaW5jbHVkZWQgaW4gYHNlbGVjdG9yc2Agb3B0aW9uLlxuICBpbmNsdWRlVGFnOiBib29sZWFuO1xuICAvLyBNYXhpbXVtIG51bWJlciBvZiBjb21iaW5hdGlvbnMgb2YgYSBzZWxlY3RvciB0eXBlLiBUaGlzIGlzIGhhbmR5IGZvciBwZXJmb3JtYW5jZSByZWFzb25zLCBlLmcuIHdoZW4gZWxlbWVudHMgaGF2ZSB0b28gbWFueSBjbGFzc25hbWVzLlxuICBtYXhDb21iaW5hdGlvbnM6IG51bWJlcjtcbiAgLy8gTWF4aW11bSBudW1iZXIgb2Ygc2VsZWN0b3IgY2FuZGlkYXRlcyB0byBiZSB0ZXN0ZWQgZm9yIGVhY2ggZWxlbWVudC4gVGhpcyBpcyBoYW5keSBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgZS5nLiB3aGVuIGVsZW1lbnRzIGNhbiBwcm9kdWNlIGxhcmdlIG51bWJlciBvZiBjb21iaW5hdGlvbnMgb2YgdmFyaW91cyB0eXBlcyBvZiBzZWxlY3RvcnMuXG4gIG1heENhbmRpZGF0ZXM6IG51bWJlcjtcbn0+O1xuXG5leHBvcnQgdHlwZSBDc3NTZWxlY3RvckdlbmVyYXRvck9wdGlvbnMgPSBSZXF1aXJlZDxcbiAgT21pdDxDc3NTZWxlY3RvckdlbmVyYXRvck9wdGlvbnNJbnB1dCwgXCJzZWxlY3RvcnNcIj4gJiB7XG4gICAgc2VsZWN0b3JzOiBDc3NTZWxlY3RvclR5cGVzO1xuICB9XG4+O1xuXG5leHBvcnQgdHlwZSBJZGVudGlmaWFibGVQYXJlbnQgPSBudWxsIHwge1xuICBmb3VuZEVsZW1lbnRzOiBFbGVtZW50W107XG4gIHNlbGVjdG9yOiBDc3NTZWxlY3Rvcjtcbn07XG5cbmV4cG9ydCB0eXBlIFBhdHRlcm5NYXRjaGVyID0gKGlucHV0OiBzdHJpbmcpID0+IGJvb2xlYW47XG4iLCIvKipcbiAqIENoZWNrcyB3aGV0aGVyIHZhbHVlIGlzIG9uZSBvZiB0aGUgZW51bSdzIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW51bVZhbHVlPFQ+KFxuICBoYXlzdGFjazogVCxcbiAgbmVlZGxlOiB1bmtub3duLFxuKTogbmVlZGxlIGlzIFRba2V5b2YgVF0ge1xuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhoYXlzdGFjaykuaW5jbHVkZXMobmVlZGxlKTtcbn1cbiIsImNvbnN0IGxpYnJhcnlOYW1lID0gXCJDc3NTZWxlY3RvckdlbmVyYXRvclwiO1xuXG4vKipcbiAqIENvbnZlbmllbnQgd3JhcHBlciBmb3IgYGNvbnNvbGUud2FybmAgdXNpbmcgY29uc2lzdGVudCBmb3JtYXR0aW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1dhcm5pbmcoaWQgPSBcInVua25vd24gcHJvYmxlbVwiLCAuLi5hcmdzOiB1bmtub3duW10pOiB2b2lkIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgY29uc29sZS53YXJuKGAke2xpYnJhcnlOYW1lfTogJHtpZH1gLCAuLi5hcmdzKTtcbn1cbiIsImltcG9ydCB7XG4gIENTU19TRUxFQ1RPUl9UWVBFLFxuICBDc3NTZWxlY3RvckdlbmVyYXRvck9wdGlvbnMsXG4gIENzc1NlbGVjdG9yTWF0Y2gsXG4gIENzc1NlbGVjdG9yVHlwZXMsXG59IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBpc0VudW1WYWx1ZSB9IGZyb20gXCIuL3V0aWxpdGllcy10eXBlc2NyaXB0LmpzXCI7XG5pbXBvcnQgeyBzaG93V2FybmluZyB9IGZyb20gXCIuL3V0aWxpdGllcy1tZXNzYWdlcy5qc1wiO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBzZWxlY3RvcnM6IFtcbiAgICBDU1NfU0VMRUNUT1JfVFlQRS5pZCxcbiAgICBDU1NfU0VMRUNUT1JfVFlQRS5jbGFzcyxcbiAgICBDU1NfU0VMRUNUT1JfVFlQRS50YWcsXG4gICAgQ1NTX1NFTEVDVE9SX1RZUEUuYXR0cmlidXRlLFxuICBdIGFzIENzc1NlbGVjdG9yVHlwZXMsXG4gIC8vIGlmIHNldCB0byB0cnVlLCBhbHdheXMgaW5jbHVkZSB0YWcgbmFtZVxuICBpbmNsdWRlVGFnOiBmYWxzZSxcbiAgd2hpdGVsaXN0OiBbXSBhcyBBcnJheTxDc3NTZWxlY3Rvck1hdGNoPixcbiAgYmxhY2tsaXN0OiBbXSBhcyBBcnJheTxDc3NTZWxlY3Rvck1hdGNoPixcbiAgY29tYmluZVdpdGhpblNlbGVjdG9yOiB0cnVlLFxuICBjb21iaW5lQmV0d2VlblNlbGVjdG9yczogdHJ1ZSxcbiAgcm9vdDogbnVsbCxcbiAgbWF4Q29tYmluYXRpb25zOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gIG1heENhbmRpZGF0ZXM6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcbn0gYXMgQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zO1xuXG4vKipcbiAqIE1ha2VzIHN1cmUgcmV0dXJuZWQgdmFsdWUgaXMgYSBsaXN0IGNvbnRhaW5pbmcgb25seSB2YWxpZCBzZWxlY3RvciB0eXBlcy5cbiAqIEBwYXJhbSBpbnB1dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVTZWxlY3RvclR5cGVzKGlucHV0OiB1bmtub3duKTogQ3NzU2VsZWN0b3JUeXBlcyB7XG4gIGlmICghQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIGlucHV0LmZpbHRlcigoaXRlbSkgPT4gaXNFbnVtVmFsdWUoQ1NTX1NFTEVDVE9SX1RZUEUsIGl0ZW0pKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBwcm92aWRlZCB2YWx1ZSBpcyBvZiB0eXBlIFJlZ0V4cC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVnRXhwKGlucHV0OiB1bmtub3duKTogaW5wdXQgaXMgUmVnRXhwIHtcbiAgcmV0dXJuIGlucHV0IGluc3RhbmNlb2YgUmVnRXhwO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHByb3ZpZGVkIHZhbHVlIGlzIHVzYWJsZSBpbiB3aGl0ZWxpc3Qgb3IgYmxhY2tsaXN0LlxuICogQHBhcmFtIGlucHV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Nzc1NlbGVjdG9yTWF0Y2goaW5wdXQ6IHVua25vd24pOiBpbnB1dCBpcyBDc3NTZWxlY3Rvck1hdGNoIHtcbiAgcmV0dXJuIFtcInN0cmluZ1wiLCBcImZ1bmN0aW9uXCJdLmluY2x1ZGVzKHR5cGVvZiBpbnB1dCkgfHwgaXNSZWdFeHAoaW5wdXQpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGlucHV0IHRvIGEgbGlzdCBvZiB2YWxpZCB2YWx1ZXMgZm9yIHdoaXRlbGlzdCBvciBibGFja2xpc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUNzc1NlbGVjdG9yTWF0Y2hMaXN0KFxuICBpbnB1dDogdW5rbm93bixcbik6IEFycmF5PENzc1NlbGVjdG9yTWF0Y2g+IHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzQ3NzU2VsZWN0b3JNYXRjaCk7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgcHJvdmlkZWQgdmFsdWUgaXMgdmFsaWQgTm9kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTm9kZShpbnB1dDogdW5rbm93bik6IGlucHV0IGlzIE5vZGUge1xuICByZXR1cm4gaW5wdXQgaW5zdGFuY2VvZiBOb2RlO1xufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHByb3ZpZGVkIHZhbHVlIGlzIHZhbGlkIFBhcmVudE5vZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcmVudE5vZGUoaW5wdXQ6IHVua25vd24pOiBpbnB1dCBpcyBQYXJlbnROb2RlIHtcbiAgY29uc3QgdmFsaWRQYXJlbnROb2RlVHlwZXM6IG51bWJlcltdID0gW1xuICAgIE5vZGUuRE9DVU1FTlRfTk9ERSxcbiAgICBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUsIC8vIHRoaXMgaW5jbHVkZXMgU2hhZG93IERPTSByb290XG4gICAgTm9kZS5FTEVNRU5UX05PREUsXG4gIF07XG5cbiAgcmV0dXJuIGlzTm9kZShpbnB1dCkgJiYgdmFsaWRQYXJlbnROb2RlVHlwZXMuaW5jbHVkZXMoaW5wdXQubm9kZVR5cGUpO1xufVxuXG4vKipcbiAqIE1ha2VzIHN1cmUgdGhhdCB0aGUgcm9vdCBub2RlIGluIG9wdGlvbnMgaXMgdmFsaWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVJvb3QoaW5wdXQ6IHVua25vd24sIGVsZW1lbnQ6IEVsZW1lbnQpOiBQYXJlbnROb2RlIHtcbiAgaWYgKGlzUGFyZW50Tm9kZShpbnB1dCkpIHtcbiAgICBpZiAoIWlucHV0LmNvbnRhaW5zKGVsZW1lbnQpKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxuICAgICAgc2hvd1dhcm5pbmcoXG4gICAgICAgIFwiZWxlbWVudCByb290IG1pc21hdGNoXCIsXG4gICAgICAgIFwiUHJvdmlkZWQgcm9vdCBkb2VzIG5vdCBjb250YWluIHRoZSBlbGVtZW50LiBUaGlzIHdpbGwgbW9zdCBsaWtlbHkgcmVzdWx0IGluIHByb2R1Y2luZyBhIGZhbGxiYWNrIHNlbGVjdG9yIHVzaW5nIGVsZW1lbnQncyByZWFsIHJvb3Qgbm9kZS4gSWYgeW91IHBsYW4gdG8gdXNlIHRoZSBzZWxlY3RvciB1c2luZyBwcm92aWRlZCByb290IChlLmcuIGByb290LnF1ZXJ5U2VsZWN0b3JgKSwgaXQgd2lsbCBudG8gd29yayBhcyBpbnRlbmRlZC5cIixcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIGNvbnN0IHJvb3ROb2RlID0gZWxlbWVudC5nZXRSb290Tm9kZSh7IGNvbXBvc2VkOiBmYWxzZSB9KTtcbiAgaWYgKGlzUGFyZW50Tm9kZShyb290Tm9kZSkpIHtcbiAgICBpZiAocm9vdE5vZGUgIT09IGRvY3VtZW50KSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxuICAgICAgc2hvd1dhcm5pbmcoXG4gICAgICAgIFwic2hhZG93IHJvb3QgaW5mZXJyZWRcIixcbiAgICAgICAgXCJZb3UgZGlkIG5vdCBwcm92aWRlIGEgcm9vdCBhbmQgdGhlIGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBTaGFkb3cgRE9NLiBUaGlzIHdpbGwgcHJvZHVjZSBhIHNlbGVjdG9yIHVzaW5nIFNoYWRvd1Jvb3QgYXMgYSByb290LiBJZiB5b3UgcGxhbiB0byB1c2UgdGhlIHNlbGVjdG9yIHVzaW5nIGRvY3VtZW50IGFzIGEgcm9vdCAoZS5nLiBgZG9jdW1lbnQucXVlcnlTZWxlY3RvcmApLCBpdCB3aWxsIG5vdCB3b3JrIGFzIGludGVuZGVkLlwiLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb3ROb2RlO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQub3duZXJEb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiOnJvb3RcIik7XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGF0IHRoZSBvdXRwdXQgaXMgYSBudW1iZXIsIHVzYWJsZSBhcyBgbWF4UmVzdWx0c2Agb3B0aW9uIGluXG4gKiBwb3dlcnNldCBnZW5lcmF0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZU1heE51bWJlcihpbnB1dD86IHVua25vd24pOiBudW1iZXIge1xuICByZXR1cm4gdHlwZW9mIGlucHV0ID09PSBcIm51bWJlclwiID8gaW5wdXQgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG59XG5cbi8qKlxuICogTWFrZXMgc3VyZSB0aGUgb3B0aW9ucyBvYmplY3QgY29udGFpbnMgYWxsIHJlcXVpcmVkIGtleXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZU9wdGlvbnMoXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4gIGN1c3RvbV9vcHRpb25zID0ge30sXG4pOiBDc3NTZWxlY3RvckdlbmVyYXRvck9wdGlvbnMge1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIC4uLkRFRkFVTFRfT1BUSU9OUyxcbiAgICAuLi5jdXN0b21fb3B0aW9ucyxcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNlbGVjdG9yczogc2FuaXRpemVTZWxlY3RvclR5cGVzKG9wdGlvbnMuc2VsZWN0b3JzKSxcbiAgICB3aGl0ZWxpc3Q6IHNhbml0aXplQ3NzU2VsZWN0b3JNYXRjaExpc3Qob3B0aW9ucy53aGl0ZWxpc3QpLFxuICAgIGJsYWNrbGlzdDogc2FuaXRpemVDc3NTZWxlY3Rvck1hdGNoTGlzdChvcHRpb25zLmJsYWNrbGlzdCksXG4gICAgcm9vdDogc2FuaXRpemVSb290KG9wdGlvbnMucm9vdCwgZWxlbWVudCksXG4gICAgY29tYmluZVdpdGhpblNlbGVjdG9yOiAhIW9wdGlvbnMuY29tYmluZVdpdGhpblNlbGVjdG9yLFxuICAgIGNvbWJpbmVCZXR3ZWVuU2VsZWN0b3JzOiAhIW9wdGlvbnMuY29tYmluZUJldHdlZW5TZWxlY3RvcnMsXG4gICAgaW5jbHVkZVRhZzogISFvcHRpb25zLmluY2x1ZGVUYWcsXG4gICAgbWF4Q29tYmluYXRpb25zOiBzYW5pdGl6ZU1heE51bWJlcihvcHRpb25zLm1heENvbWJpbmF0aW9ucyksXG4gICAgbWF4Q2FuZGlkYXRlczogc2FuaXRpemVNYXhOdW1iZXIob3B0aW9ucy5tYXhDYW5kaWRhdGVzKSxcbiAgfTtcbn1cbiIsImltcG9ydCB7IENzc1NlbGVjdG9yTWF0Y2gsIFBhdHRlcm5NYXRjaGVyIH0gZnJvbSBcIi4vdHlwZXMuanNcIjtcbmltcG9ydCB7IGlzUmVnRXhwIH0gZnJvbSBcIi4vdXRpbGl0aWVzLW9wdGlvbnMuanNcIjtcbmltcG9ydCB7IHNob3dXYXJuaW5nIH0gZnJvbSBcIi4vdXRpbGl0aWVzLW1lc3NhZ2VzLmpzXCI7XG5cbi8qKlxuICogQ3JlYXRlcyBhcnJheSBjb250YWluaW5nIG9ubHkgaXRlbXMgaW5jbHVkZWQgaW4gYWxsIGlucHV0IGFycmF5cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVyc2VjdGlvbjxUPihpdGVtczogQXJyYXk8QXJyYXk8VD4+ID0gW10pOiBBcnJheTxUPiB7XG4gIGNvbnN0IFtmaXJzdEl0ZW0gPSBbXSwgLi4ub3RoZXJJdGVtc10gPSBpdGVtcztcbiAgaWYgKG90aGVySXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZpcnN0SXRlbTtcbiAgfVxuICByZXR1cm4gb3RoZXJJdGVtcy5yZWR1Y2UoKGFjY3VtdWxhdG9yLCBjdXJyZW50VmFsdWUpID0+IHtcbiAgICByZXR1cm4gYWNjdW11bGF0b3IuZmlsdGVyKChpdGVtKSA9PiBjdXJyZW50VmFsdWUuaW5jbHVkZXMoaXRlbSkpO1xuICB9LCBmaXJzdEl0ZW0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGFycmF5IG9mIGFycmF5cyBpbnRvIGEgZmxhdCBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5BcnJheTxUPihpbnB1dDogQXJyYXk8QXJyYXk8VD4+KTogQXJyYXk8VD4ge1xuICByZXR1cm4gKFtdIGFzIEFycmF5PFQ+KS5jb25jYXQoLi4uaW5wdXQpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgc3RyaW5nIHRoYXQgY2FuIGNvbnRhaW4gd2lsZGNhcmRzIChhc3Rlcmlza3MpIHRvIFJlZ0V4cCBzb3VyY2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aWxkY2FyZFRvUmVnRXhwKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gKFxuICAgIGlucHV0XG4gICAgICAvLyBjb252ZXJ0IGFsbCBzcGVjaWFsIGNoYXJhY3RlcnMgdXNlZCBieSBSZWdFeHAsIGV4Y2VwdCBhbiBhc3Rlcmlza1xuICAgICAgLnJlcGxhY2UoL1t8XFxcXHt9KClbXFxdXiQrPy5dL2csIFwiXFxcXCQmXCIpXG4gICAgICAvLyBjb252ZXJ0IGFzdGVyaXNrIHRvIHBhdHRlcm4gdGhhdCBtYXRjaGVzIGFueXRoaW5nXG4gICAgICAucmVwbGFjZSgvXFwqL2csIFwiLitcIilcbiAgKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGZ1bmN0aW9uIHRoYXQgd2lsbCB0ZXN0IGxpc3Qgb2YgcHJvdmlkZWQgbWF0Y2hlcnMgYWdhaW5zdCBpbnB1dC5cbiAqIFVzZWQgZm9yIHdoaXRlL2JsYWNrbGlzdCBmdW5jdGlvbmFsaXR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGF0dGVybk1hdGNoZXIobGlzdDogQ3NzU2VsZWN0b3JNYXRjaFtdKTogUGF0dGVybk1hdGNoZXIge1xuICBjb25zdCBtYXRjaEZ1bmN0aW9ucyA9IGxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgaWYgKGlzUmVnRXhwKGl0ZW0pKSB7XG4gICAgICByZXR1cm4gKGlucHV0OiBzdHJpbmcpID0+IGl0ZW0udGVzdChpbnB1dCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBpdGVtID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiAoaW5wdXQ6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBpdGVtKGlucHV0KTtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW5cbiAgICAgICAgICBzaG93V2FybmluZyhcbiAgICAgICAgICAgIFwicGF0dGVybiBtYXRjaGVyIGZ1bmN0aW9uIGludmFsaWRcIixcbiAgICAgICAgICAgIFwiUHJvdmlkZWQgcGF0dGVybiBtYXRjaGluZyBmdW5jdGlvbiBkb2VzIG5vdCByZXR1cm4gYm9vbGVhbi4gSXQncyByZXN1bHQgd2lsbCBiZSBpZ25vcmVkLlwiLFxuICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGl0ZW0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIl5cIiArIHdpbGRjYXJkVG9SZWdFeHAoaXRlbSkgKyBcIiRcIik7XG4gICAgICByZXR1cm4gKGlucHV0OiBzdHJpbmcpID0+IHJlLnRlc3QoaW5wdXQpO1xuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXG4gICAgc2hvd1dhcm5pbmcoXG4gICAgICBcInBhdHRlcm4gbWF0Y2hlciBpbnZhbGlkXCIsXG4gICAgICBcIlBhdHRlcm4gbWF0Y2hpbmcgb25seSBhY2NlcHRzIHN0cmluZ3MsIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYW5kL29yIGZ1bmN0aW9ucy4gVGhpcyBpdGVtIGlzIGludmFsaWQgYW5kIHdpbGwgYmUgaWdub3JlZC5cIixcbiAgICAgIGl0ZW0sXG4gICAgKTtcbiAgICByZXR1cm4gKCkgPT4gZmFsc2U7XG4gIH0pO1xuXG4gIHJldHVybiAoaW5wdXQ6IHN0cmluZykgPT5cbiAgICBtYXRjaEZ1bmN0aW9ucy5zb21lKChtYXRjaEZ1bmN0aW9uKSA9PiBtYXRjaEZ1bmN0aW9uKGlucHV0KSk7XG59XG4iLCJpbXBvcnQgeyBpc0VsZW1lbnQgfSBmcm9tIFwiLi91dGlsaXRpZXMtaXNlbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBDc3NTZWxlY3RvciB9IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBnZXRJbnRlcnNlY3Rpb24gfSBmcm9tIFwiLi91dGlsaXRpZXMtZGF0YS5qc1wiO1xuaW1wb3J0IHsgc2FuaXRpemVSb290IH0gZnJvbSBcIi4vdXRpbGl0aWVzLW9wdGlvbnMuanNcIjtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGVsZW1lbnQgaXMgbWF0Y2hlZCB1bmlxdWVseSBieSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRlc3RTZWxlY3RvcihcbiAgZWxlbWVudHM6IEVsZW1lbnRbXSxcbiAgc2VsZWN0b3I6IENzc1NlbGVjdG9yLFxuICByb290PzogTm9kZSxcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBBcnJheS5mcm9tKFxuICAgIHNhbml0aXplUm9vdChyb290LCBlbGVtZW50c1swXSkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvciksXG4gICk7XG4gIHJldHVybiAoXG4gICAgcmVzdWx0Lmxlbmd0aCA9PT0gZWxlbWVudHMubGVuZ3RoICYmXG4gICAgZWxlbWVudHMuZXZlcnkoKGVsZW1lbnQpID0+IHJlc3VsdC5pbmNsdWRlcyhlbGVtZW50KSlcbiAgKTtcbn1cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgc2VsZWN0b3IgdGFyZ2V0cyBlbGVtZW50LiBJdCBkb2VzIG5vdCBoYXZlIHRvIGJlIGEgdW5pcXVlIG1hdGNoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGVzdE11bHRpU2VsZWN0b3IoXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4gIHNlbGVjdG9yOiBDc3NTZWxlY3RvcixcbiAgcm9vdDogUGFyZW50Tm9kZSxcbik6IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBBcnJheS5mcm9tKFxuICAgIHNhbml0aXplUm9vdChyb290LCBlbGVtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSxcbiAgKTtcbiAgcmV0dXJuIHJlc3VsdC5pbmNsdWRlcyhlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBGaW5kIGFsbCBwYXJlbnRzIG9mIGEgc2luZ2xlIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50UGFyZW50cyhcbiAgZWxlbWVudDogRWxlbWVudCxcbiAgcm9vdD86IFBhcmVudE5vZGUsXG4pOiBFbGVtZW50W10ge1xuICByb290ID0gcm9vdCA/PyBnZXRSb290Tm9kZShlbGVtZW50KTtcbiAgY29uc3QgcmVzdWx0ID0gW107XG4gIGxldCBwYXJlbnQgPSBlbGVtZW50O1xuICB3aGlsZSAoaXNFbGVtZW50KHBhcmVudCkgJiYgcGFyZW50ICE9PSByb290KSB7XG4gICAgcmVzdWx0LnB1c2gocGFyZW50KTtcbiAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50RWxlbWVudDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEZpbmQgYWxsIGNvbW1vbiBwYXJlbnRzIG9mIGVsZW1lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyZW50cyhlbGVtZW50czogRWxlbWVudFtdLCByb290PzogUGFyZW50Tm9kZSk6IEVsZW1lbnRbXSB7XG4gIHJldHVybiBnZXRJbnRlcnNlY3Rpb24oXG4gICAgZWxlbWVudHMubWFwKChlbGVtZW50KSA9PiBnZXRFbGVtZW50UGFyZW50cyhlbGVtZW50LCByb290KSksXG4gICk7XG59XG5cbi8qKlxuICogUmV0dXJucyByb290IG5vZGUgZm9yIGdpdmVuIGVsZW1lbnQuIFRoaXMgbmVlZHMgdG8gYmUgdXNlZCBiZWNhdXNlIG9mIGRvY3VtZW50LWxlc3MgZW52aXJvbm1lbnRzLCBlLmcuIGpzZG9tLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdE5vZGUoZWxlbWVudDogRWxlbWVudCk6IFBhcmVudE5vZGUge1xuICByZXR1cm4gZWxlbWVudC5vd25lckRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCI6cm9vdFwiKTtcbn1cbiIsImltcG9ydCB7IENTU19TRUxFQ1RPUl9UWVBFLCBDc3NTZWxlY3RvclR5cGUgfSBmcm9tIFwiLi90eXBlcy5qc1wiO1xuXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfU0VQQVJBVE9SID0gXCIsIFwiO1xuXG4vLyBSZWdFeHAgdGhhdCB3aWxsIG1hdGNoIGludmFsaWQgcGF0dGVybnMgdGhhdCBjYW4gYmUgdXNlZCBpbiBJRCBhdHRyaWJ1dGUuXG5leHBvcnQgY29uc3QgSU5WQUxJRF9JRF9SRSA9IG5ldyBSZWdFeHAoXG4gIFtcbiAgICBcIl4kXCIsIC8vIGVtcHR5IG9yIG5vdCBzZXRcbiAgICBcIlxcXFxzXCIsIC8vIGNvbnRhaW5zIHdoaXRlc3BhY2VcbiAgXS5qb2luKFwifFwiKSxcbik7XG5cbi8vIFJlZ0V4cCB0aGF0IHdpbGwgbWF0Y2ggaW52YWxpZCBwYXR0ZXJucyB0aGF0IGNhbiBiZSB1c2VkIGluIGNsYXNzIGF0dHJpYnV0ZS5cbmV4cG9ydCBjb25zdCBJTlZBTElEX0NMQVNTX1JFID0gbmV3IFJlZ0V4cChcbiAgW1xuICAgIFwiXiRcIiwgLy8gZW1wdHkgb3Igbm90IHNldFxuICBdLmpvaW4oXCJ8XCIpLFxuKTtcblxuLy8gT3JkZXIgaW4gd2hpY2ggYSBjb21iaW5lZCBzZWxlY3RvciBpcyBjb25zdHJ1Y3RlZC5cbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9QQVRURVJOID0gW1xuICBDU1NfU0VMRUNUT1JfVFlQRS5udGhvZnR5cGUsXG4gIENTU19TRUxFQ1RPUl9UWVBFLnRhZyxcbiAgQ1NTX1NFTEVDVE9SX1RZUEUuaWQsXG4gIENTU19TRUxFQ1RPUl9UWVBFLmNsYXNzLFxuICBDU1NfU0VMRUNUT1JfVFlQRS5hdHRyaWJ1dGUsXG4gIENTU19TRUxFQ1RPUl9UWVBFLm50aGNoaWxkLFxuXTtcbiIsImltcG9ydCB7IHNhbml0aXplU2VsZWN0b3JJdGVtIH0gZnJvbSBcIi4vdXRpbGl0aWVzLXNlbGVjdG9ycy5qc1wiO1xuaW1wb3J0IHsgY3JlYXRlUGF0dGVybk1hdGNoZXIsIGdldEludGVyc2VjdGlvbiB9IGZyb20gXCIuL3V0aWxpdGllcy1kYXRhLmpzXCI7XG5pbXBvcnQgeyBDc3NTZWxlY3RvckdlbmVyYXRlZCB9IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5cbnR5cGUgQXR0cmlidXRlRGF0YSA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZTogc3RyaW5nO1xufTtcblxuLy8gTGlzdCBvZiBhdHRyaWJ1dGVzIHRvIGJlIGlnbm9yZWQuIFRoZXNlIGFyZSBoYW5kbGVkIGJ5IGRpZmZlcmVudCBzZWxlY3RvciB0eXBlcy5cbmV4cG9ydCBjb25zdCBhdHRyaWJ1dGVCbGFja2xpc3RNYXRjaCA9IGNyZWF0ZVBhdHRlcm5NYXRjaGVyKFtcbiAgXCJjbGFzc1wiLFxuICBcImlkXCIsXG4gIC8vIEFuZ3VsYXIgYXR0cmlidXRlc1xuICBcIm5nLSpcIixcbl0pO1xuXG4vKipcbiAqIEdldCBzaW1wbGlmaWVkIGF0dHJpYnV0ZSBzZWxlY3RvciBmb3IgYW4gZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHJpYnV0ZU5vZGVUb1NpbXBsaWZpZWRTZWxlY3Rvcih7XG4gIG5hbWUsXG59OiBBdHRyaWJ1dGVEYXRhKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWQge1xuICByZXR1cm4gYFske25hbWV9XWAgYXMgQ3NzU2VsZWN0b3JHZW5lcmF0ZWQ7XG59XG5cbi8qKlxuICogR2V0IGF0dHJpYnV0ZSBzZWxlY3RvciBmb3IgYW4gZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dHJpYnV0ZU5vZGVUb1NlbGVjdG9yKHtcbiAgbmFtZSxcbiAgdmFsdWUsXG59OiBBdHRyaWJ1dGVEYXRhKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWQge1xuICByZXR1cm4gYFske25hbWV9PScke3ZhbHVlfSddYCBhcyBDc3NTZWxlY3RvckdlbmVyYXRlZDtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhdHRyaWJ1dGUgc2hvdWxkIGJlIHVzZWQgYXMgYSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRBdHRyaWJ1dGVOb2RlKFxuICB7IG5vZGVOYW1lIH06IE5vZGUsXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4pOiBib29sZWFuIHtcbiAgLy8gZm9ybSBpbnB1dCB2YWx1ZSBzaG91bGQgbm90IGJlIHVzZWQgYXMgYSBzZWxlY3RvclxuICBjb25zdCB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChbXCJpbnB1dFwiLCBcIm9wdGlvblwiXS5pbmNsdWRlcyh0YWdOYW1lKSAmJiBub2RlTmFtZSA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuICFhdHRyaWJ1dGVCbGFja2xpc3RNYXRjaChub2RlTmFtZSk7XG59XG5cbi8qKlxuICogU2FuaXRpemUgYWxsIGF0dHJpYnV0ZSBkYXRhLiBXZSB3YW50IHRvIGRvIGl0IG9uY2UsIGJlZm9yZSB3ZSBzdGFydCB0byBnZW5lcmF0ZSBzaW1wbGlmaWVkL2Z1bGwgc2VsZWN0b3JzIGZyb20gdGhlIHNhbWUgZGF0YS5cbiAqL1xuZnVuY3Rpb24gc2FuaXRpemVBdHRyaWJ1dGVEYXRhKHsgbm9kZU5hbWUsIG5vZGVWYWx1ZSB9OiBOb2RlKTogQXR0cmlidXRlRGF0YSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogc2FuaXRpemVTZWxlY3Rvckl0ZW0obm9kZU5hbWUpLFxuICAgIHZhbHVlOiBzYW5pdGl6ZVNlbGVjdG9ySXRlbShub2RlVmFsdWUpLFxuICB9O1xufVxuXG4vKipcbiAqIEdldCBhdHRyaWJ1dGUgc2VsZWN0b3JzIGZvciBhbiBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudEF0dHJpYnV0ZVNlbGVjdG9ycyhcbiAgZWxlbWVudDogRWxlbWVudCxcbik6IENzc1NlbGVjdG9yR2VuZXJhdGVkW10ge1xuICBjb25zdCB2YWxpZEF0dHJpYnV0ZXMgPSBBcnJheS5mcm9tKGVsZW1lbnQuYXR0cmlidXRlcylcbiAgICAuZmlsdGVyKChhdHRyaWJ1dGVOb2RlKSA9PiBpc1ZhbGlkQXR0cmlidXRlTm9kZShhdHRyaWJ1dGVOb2RlLCBlbGVtZW50KSlcbiAgICAubWFwKHNhbml0aXplQXR0cmlidXRlRGF0YSk7XG4gIHJldHVybiBbXG4gICAgLi4udmFsaWRBdHRyaWJ1dGVzLm1hcChhdHRyaWJ1dGVOb2RlVG9TaW1wbGlmaWVkU2VsZWN0b3IpLFxuICAgIC4uLnZhbGlkQXR0cmlidXRlcy5tYXAoYXR0cmlidXRlTm9kZVRvU2VsZWN0b3IpLFxuICBdO1xufVxuXG4vKipcbiAqIEdldCBhdHRyaWJ1dGUgc2VsZWN0b3JzIG1hdGNoaW5nIGFsbCBlbGVtZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF0dHJpYnV0ZVNlbGVjdG9ycyhcbiAgZWxlbWVudHM6IEVsZW1lbnRbXSxcbik6IENzc1NlbGVjdG9yR2VuZXJhdGVkW10ge1xuICBjb25zdCBlbGVtZW50U2VsZWN0b3JzID0gZWxlbWVudHMubWFwKGdldEVsZW1lbnRBdHRyaWJ1dGVTZWxlY3RvcnMpO1xuICByZXR1cm4gZ2V0SW50ZXJzZWN0aW9uKGVsZW1lbnRTZWxlY3RvcnMpO1xufVxuIiwiaW1wb3J0IHsgc2FuaXRpemVTZWxlY3Rvckl0ZW0gfSBmcm9tIFwiLi91dGlsaXRpZXMtc2VsZWN0b3JzLmpzXCI7XG5pbXBvcnQgeyBJTlZBTElEX0NMQVNTX1JFIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgeyBDc3NTZWxlY3RvckdlbmVyYXRlZCB9IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBnZXRJbnRlcnNlY3Rpb24gfSBmcm9tIFwiLi91dGlsaXRpZXMtZGF0YS5qc1wiO1xuXG4vKipcbiAqIEdldCBjbGFzcyBzZWxlY3RvcnMgZm9yIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50Q2xhc3NTZWxlY3RvcnMoXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4pOiBDc3NTZWxlY3RvckdlbmVyYXRlZFtdIHtcbiAgcmV0dXJuIChlbGVtZW50LmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpXG4gICAgLnRyaW0oKVxuICAgIC5zcGxpdCgvXFxzKy8pXG4gICAgLmZpbHRlcigoaXRlbSkgPT4gIUlOVkFMSURfQ0xBU1NfUkUudGVzdChpdGVtKSlcbiAgICAubWFwKChpdGVtKSA9PiBgLiR7c2FuaXRpemVTZWxlY3Rvckl0ZW0oaXRlbSl9YCBhcyBDc3NTZWxlY3RvckdlbmVyYXRlZCk7XG59XG5cbi8qKlxuICogR2V0IGNsYXNzIHNlbGVjdG9ycyBtYXRjaGluZyBhbGwgZWxlbWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbGFzc1NlbGVjdG9ycyhlbGVtZW50czogRWxlbWVudFtdKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWRbXSB7XG4gIGNvbnN0IGVsZW1lbnRTZWxlY3RvcnMgPSBlbGVtZW50cy5tYXAoZ2V0RWxlbWVudENsYXNzU2VsZWN0b3JzKTtcbiAgcmV0dXJuIGdldEludGVyc2VjdGlvbihlbGVtZW50U2VsZWN0b3JzKTtcbn1cbiIsImltcG9ydCB7IHNhbml0aXplU2VsZWN0b3JJdGVtIH0gZnJvbSBcIi4vdXRpbGl0aWVzLXNlbGVjdG9ycy5qc1wiO1xuaW1wb3J0IHsgSU5WQUxJRF9JRF9SRSB9IGZyb20gXCIuL2NvbnN0YW50cy5qc1wiO1xuaW1wb3J0IHsgdGVzdFNlbGVjdG9yIH0gZnJvbSBcIi4vdXRpbGl0aWVzLWRvbS5qc1wiO1xuaW1wb3J0IHsgQ3NzU2VsZWN0b3JHZW5lcmF0ZWQgfSBmcm9tIFwiLi90eXBlcy5qc1wiO1xuXG4vKipcbiAqIEdldCBJRCBzZWxlY3RvciBmb3IgYW4gZWxlbWVudC5cbiAqICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWxlbWVudElkU2VsZWN0b3JzKFxuICBlbGVtZW50OiBFbGVtZW50LFxuKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWRbXSB7XG4gIGNvbnN0IGlkID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJpZFwiKSB8fCBcIlwiO1xuICBjb25zdCBzZWxlY3RvciA9IGAjJHtzYW5pdGl6ZVNlbGVjdG9ySXRlbShpZCl9YCBhcyBDc3NTZWxlY3RvckdlbmVyYXRlZDtcbiAgY29uc3Qgcm9vdE5vZGUgPSBlbGVtZW50LmdldFJvb3ROb2RlKHsgY29tcG9zZWQ6IGZhbHNlIH0pO1xuICByZXR1cm4gIUlOVkFMSURfSURfUkUudGVzdChpZCkgJiYgdGVzdFNlbGVjdG9yKFtlbGVtZW50XSwgc2VsZWN0b3IsIHJvb3ROb2RlKVxuICAgID8gW3NlbGVjdG9yXVxuICAgIDogW107XG59XG5cbi8qKlxuICogR2V0IElEIHNlbGVjdG9yIGZvciBhbiBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRTZWxlY3RvcihlbGVtZW50czogRWxlbWVudFtdKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWRbXSB7XG4gIHJldHVybiBlbGVtZW50cy5sZW5ndGggPT09IDAgfHwgZWxlbWVudHMubGVuZ3RoID4gMVxuICAgID8gW11cbiAgICA6IGdldEVsZW1lbnRJZFNlbGVjdG9ycyhlbGVtZW50c1swXSk7XG59XG4iLCJpbXBvcnQgeyBpc0VsZW1lbnQgfSBmcm9tIFwiLi91dGlsaXRpZXMtaXNlbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBDc3NTZWxlY3RvckdlbmVyYXRlZCB9IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBnZXRJbnRlcnNlY3Rpb24gfSBmcm9tIFwiLi91dGlsaXRpZXMtZGF0YS5qc1wiO1xuXG4vKipcbiAqIEdldCBudGgtY2hpbGQgc2VsZWN0b3IgZm9yIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50TnRoQ2hpbGRTZWxlY3RvcihcbiAgZWxlbWVudDogRWxlbWVudCxcbik6IENzc1NlbGVjdG9yR2VuZXJhdGVkW10ge1xuICBjb25zdCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIGNvbnN0IHNpYmxpbmdzID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGROb2RlcykuZmlsdGVyKGlzRWxlbWVudCk7XG4gICAgY29uc3QgZWxlbWVudEluZGV4ID0gc2libGluZ3MuaW5kZXhPZihlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudEluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiBbYDpudGgtY2hpbGQoJHtlbGVtZW50SW5kZXggKyAxfSlgIGFzIENzc1NlbGVjdG9yR2VuZXJhdGVkXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW107XG59XG5cbi8qKlxuICogR2V0IG50aC1jaGlsZCBzZWxlY3RvciBtYXRjaGluZyBhbGwgZWxlbWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROdGhDaGlsZFNlbGVjdG9yKFxuICBlbGVtZW50czogRWxlbWVudFtdLFxuKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWRbXSB7XG4gIHJldHVybiBnZXRJbnRlcnNlY3Rpb24oZWxlbWVudHMubWFwKGdldEVsZW1lbnROdGhDaGlsZFNlbGVjdG9yKSk7XG59XG4iLCJpbXBvcnQgeyBzYW5pdGl6ZVNlbGVjdG9ySXRlbSB9IGZyb20gXCIuL3V0aWxpdGllcy1zZWxlY3RvcnMuanNcIjtcbmltcG9ydCB7IENzc1NlbGVjdG9yLCBDc3NTZWxlY3RvckdlbmVyYXRlZCB9IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBmbGF0dGVuQXJyYXkgfSBmcm9tIFwiLi91dGlsaXRpZXMtZGF0YS5qc1wiO1xuXG4vKipcbiAqIEdldCB0YWcgc2VsZWN0b3IgZm9yIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50VGFnU2VsZWN0b3JzKFxuICBlbGVtZW50OiBFbGVtZW50LFxuKTogQ3NzU2VsZWN0b3JHZW5lcmF0ZWRbXSB7XG4gIHJldHVybiBbXG4gICAgc2FuaXRpemVTZWxlY3Rvckl0ZW0oZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkpIGFzIENzc1NlbGVjdG9yR2VuZXJhdGVkLFxuICBdO1xufVxuXG4vKipcbiAqIEdldCB0YWcgc2VsZWN0b3IgZm9yIGxpc3Qgb2YgZWxlbWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWdTZWxlY3RvcihlbGVtZW50czogRWxlbWVudFtdKTogQXJyYXk8Q3NzU2VsZWN0b3I+IHtcbiAgY29uc3Qgc2VsZWN0b3JzID0gW1xuICAgIC4uLm5ldyBTZXQoZmxhdHRlbkFycmF5KGVsZW1lbnRzLm1hcChnZXRFbGVtZW50VGFnU2VsZWN0b3JzKSkpLFxuICBdO1xuICByZXR1cm4gc2VsZWN0b3JzLmxlbmd0aCA9PT0gMCB8fCBzZWxlY3RvcnMubGVuZ3RoID4gMSA/IFtdIDogW3NlbGVjdG9yc1swXV07XG59XG4iLCJpbXBvcnQgeyBnZXRUYWdTZWxlY3RvciB9IGZyb20gXCIuL3NlbGVjdG9yLXRhZy5qc1wiO1xuaW1wb3J0IHsgQ3NzU2VsZWN0b3JHZW5lcmF0ZWQgfSBmcm9tIFwiLi90eXBlcy5qc1wiO1xuaW1wb3J0IHsgZ2V0SW50ZXJzZWN0aW9uIH0gZnJvbSBcIi4vdXRpbGl0aWVzLWRhdGEuanNcIjtcblxuLyoqXG4gKiBHZXQgbnRoLW9mLXR5cGUgc2VsZWN0b3IgZm9yIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50TnRoT2ZUeXBlU2VsZWN0b3IoXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4pOiBDc3NTZWxlY3RvckdlbmVyYXRlZFtdIHtcbiAgY29uc3QgdGFnID0gZ2V0VGFnU2VsZWN0b3IoW2VsZW1lbnRdKVswXTtcbiAgY29uc3QgcGFyZW50RWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcblxuICBpZiAocGFyZW50RWxlbWVudCkge1xuICAgIGNvbnN0IHNpYmxpbmdzID0gQXJyYXkuZnJvbShwYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5maWx0ZXIoXG4gICAgICAoZWxlbWVudCkgPT4gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IHRhZyxcbiAgICApO1xuICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IHNpYmxpbmdzLmluZGV4T2YoZWxlbWVudCk7XG4gICAgaWYgKGVsZW1lbnRJbmRleCA+IC0xKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBgJHt0YWd9Om50aC1vZi10eXBlKCR7ZWxlbWVudEluZGV4ICsgMX0pYCBhcyBDc3NTZWxlY3RvckdlbmVyYXRlZCxcbiAgICAgIF07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFtdO1xufVxuXG4vKipcbiAqIEdldCBOdGgtb2YtdHlwZSBzZWxlY3RvciBtYXRjaGluZyBhbGwgZWxlbWVudHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROdGhPZlR5cGVTZWxlY3RvcihcbiAgZWxlbWVudHM6IEVsZW1lbnRbXSxcbik6IENzc1NlbGVjdG9yR2VuZXJhdGVkW10ge1xuICByZXR1cm4gZ2V0SW50ZXJzZWN0aW9uKGVsZW1lbnRzLm1hcChnZXRFbGVtZW50TnRoT2ZUeXBlU2VsZWN0b3IpKTtcbn1cbiIsInR5cGUgcG93ZXJTZXRHZW5lcmF0b3JPcHRpb25zID0ge1xuICBtYXhSZXN1bHRzPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uKiBwb3dlclNldEdlbmVyYXRvcjxUPihcbiAgaW5wdXQ6IEFycmF5PFQ+ID0gW10sXG4gIHsgbWF4UmVzdWx0cyA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSB9OiBwb3dlclNldEdlbmVyYXRvck9wdGlvbnMgPSB7fSxcbik6IEl0ZXJhYmxlSXRlcmF0b3I8QXJyYXk8VD4+IHtcbiAgbGV0IHJlc3VsdENvdW50ZXIgPSAwO1xuICBsZXQgb2Zmc2V0cyA9IGdlbmVyYXRlT2Zmc2V0cygxKTtcblxuICB3aGlsZSAob2Zmc2V0cy5sZW5ndGggPD0gaW5wdXQubGVuZ3RoICYmIHJlc3VsdENvdW50ZXIgPCBtYXhSZXN1bHRzKSB7XG4gICAgcmVzdWx0Q291bnRlciArPSAxO1xuICAgIGNvbnN0IHJlc3VsdCA9IG9mZnNldHMubWFwKChvZmZzZXQpID0+IGlucHV0W29mZnNldF0pO1xuICAgIHlpZWxkIHJlc3VsdDtcbiAgICBvZmZzZXRzID0gYnVtcE9mZnNldHMob2Zmc2V0cywgaW5wdXQubGVuZ3RoIC0gMSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgcG93ZXIgc2V0IG9mIGlucHV0IGl0ZW1zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG93ZXJTZXQ8VD4oXG4gIGlucHV0OiBBcnJheTxUPiA9IFtdLFxuICB7IG1heFJlc3VsdHMgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgfTogcG93ZXJTZXRHZW5lcmF0b3JPcHRpb25zID0ge30sXG4pOiBBcnJheTxBcnJheTxUPj4ge1xuICByZXR1cm4gQXJyYXkuZnJvbShwb3dlclNldEdlbmVyYXRvcihpbnB1dCwgeyBtYXhSZXN1bHRzIH0pKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdXNlZCBieSBgZ2V0UG93ZXJTZXRgLiBVcGRhdGVzIGludGVybmFsIHBvaW50ZXJzLlxuICovXG5mdW5jdGlvbiBidW1wT2Zmc2V0cyhvZmZzZXRzOiBudW1iZXJbXSA9IFtdLCBtYXhWYWx1ZSA9IDApOiBudW1iZXJbXSB7XG4gIGNvbnN0IHNpemUgPSBvZmZzZXRzLmxlbmd0aDtcbiAgaWYgKHNpemUgPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gWy4uLm9mZnNldHNdO1xuICByZXN1bHRbc2l6ZSAtIDFdICs9IDE7XG4gIGZvciAobGV0IGluZGV4ID0gc2l6ZSAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pIHtcbiAgICBpZiAocmVzdWx0W2luZGV4XSA+IG1heFZhbHVlKSB7XG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlT2Zmc2V0cyhzaXplICsgMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbaW5kZXggLSAxXSsrO1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gcmVzdWx0W2luZGV4IC0gMV0gKyAxO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChyZXN1bHRbc2l6ZSAtIDFdID4gbWF4VmFsdWUpIHtcbiAgICByZXR1cm4gZ2VuZXJhdGVPZmZzZXRzKHNpemUgKyAxKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGFycmF5IG9mIHNpemUgTiwgZmlsbGVkIHdpdGggbnVtYmVycyBzZXF1ZW5jZSBzdGFydGluZyBmcm9tIDAuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlT2Zmc2V0cyhzaXplID0gMSk6IEFycmF5PG51bWJlcj4ge1xuICByZXR1cm4gQXJyYXkuZnJvbShBcnJheShzaXplKS5rZXlzKCkpO1xufVxuIiwiLyoqXG4gKiBHZW5lcmF0ZXMgY2FydGVzaWFuIHByb2R1Y3Qgb3V0IG9mIGlucHV0IG9iamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhcnRlc2lhblByb2R1Y3Q8VD4oXG4gIGlucHV0OiBSZWNvcmQ8c3RyaW5nLCBUW10+ID0ge30sXG4pOiBSZWNvcmQ8c3RyaW5nLCBUPltdIHtcbiAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgVD5bXSA9IFtdO1xuICBPYmplY3QuZW50cmllcyhpbnB1dCkuZm9yRWFjaCgoW2tleSwgdmFsdWVzXSkgPT4ge1xuICAgIHJlc3VsdCA9IHZhbHVlcy5mbGF0TWFwKCh2YWx1ZSkgPT4ge1xuICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFt7IFtrZXldOiB2YWx1ZSB9XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXN1bHQubWFwKChtZW1vKSA9PiAoe1xuICAgICAgICAgIC4uLm1lbW8sXG4gICAgICAgICAgW2tleV06IHZhbHVlLFxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiaW1wb3J0IHsgU0VMRUNUT1JfUEFUVEVSTiB9IGZyb20gXCIuL2NvbnN0YW50cy5qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0QXR0cmlidXRlU2VsZWN0b3JzLFxuICBnZXRFbGVtZW50QXR0cmlidXRlU2VsZWN0b3JzLFxufSBmcm9tIFwiLi9zZWxlY3Rvci1hdHRyaWJ1dGUuanNcIjtcbmltcG9ydCB7XG4gIGdldENsYXNzU2VsZWN0b3JzLFxuICBnZXRFbGVtZW50Q2xhc3NTZWxlY3RvcnMsXG59IGZyb20gXCIuL3NlbGVjdG9yLWNsYXNzLmpzXCI7XG5pbXBvcnQgeyBnZXRFbGVtZW50SWRTZWxlY3RvcnMsIGdldElkU2VsZWN0b3IgfSBmcm9tIFwiLi9zZWxlY3Rvci1pZC5qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0RWxlbWVudE50aENoaWxkU2VsZWN0b3IsXG4gIGdldE50aENoaWxkU2VsZWN0b3IsXG59IGZyb20gXCIuL3NlbGVjdG9yLW50aC1jaGlsZC5qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0RWxlbWVudE50aE9mVHlwZVNlbGVjdG9yLFxuICBnZXROdGhPZlR5cGVTZWxlY3Rvcixcbn0gZnJvbSBcIi4vc2VsZWN0b3ItbnRoLW9mLXR5cGUuanNcIjtcbmltcG9ydCB7IGdldEVsZW1lbnRUYWdTZWxlY3RvcnMsIGdldFRhZ1NlbGVjdG9yIH0gZnJvbSBcIi4vc2VsZWN0b3ItdGFnLmpzXCI7XG5pbXBvcnQgeyBjcmVhdGVQYXR0ZXJuTWF0Y2hlciwgZmxhdHRlbkFycmF5IH0gZnJvbSBcIi4vdXRpbGl0aWVzLWRhdGEuanNcIjtcbmltcG9ydCB7IGdldFBhcmVudHMsIHRlc3RTZWxlY3RvciB9IGZyb20gXCIuL3V0aWxpdGllcy1kb20uanNcIjtcbmltcG9ydCB7XG4gIENTU19TRUxFQ1RPUl9UWVBFLFxuICBDc3NTZWxlY3RvcixcbiAgQ3NzU2VsZWN0b3JEYXRhLFxuICBDc3NTZWxlY3RvckdlbmVyYXRlZCxcbiAgQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zLFxuICBDc3NTZWxlY3RvclR5cGUsXG4gIENzc1NlbGVjdG9yVHlwZXMsXG4gIElkZW50aWZpYWJsZVBhcmVudCxcbiAgT1BFUkFUT1IsXG4gIFBhdHRlcm5NYXRjaGVyLFxufSBmcm9tIFwiLi90eXBlcy5qc1wiO1xuaW1wb3J0IHsgaXNFbGVtZW50IH0gZnJvbSBcIi4vdXRpbGl0aWVzLWlzZWxlbWVudC5qc1wiO1xuaW1wb3J0IHsgZ2V0UG93ZXJTZXQgfSBmcm9tIFwiLi91dGlsaXRpZXMtcG93ZXJzZXQuanNcIjtcbmltcG9ydCB7IGdldENhcnRlc2lhblByb2R1Y3QgfSBmcm9tIFwiLi91dGlsaXRpZXMtY2FydGVzaWFuLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBFU0NBUEVEX0NPTE9OID0gXCI6XCIuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblxuLy8gU3F1YXJlIGJyYWNrZXRzIG5lZWQgdG8gYmUgZXNjYXBlZCwgYnV0IGVzbGludCBoYXMgYSBwcm9ibGVtIHdpdGggdGhhdC5cbi8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZSAqL1xuZXhwb3J0IGNvbnN0IFNQRUNJQUxfQ0hBUkFDVEVSU19SRSA9IC9bICFcIiMkJSYnKClcXFtcXF17fH08PiorLC4vOz0/QF5gflxcXFxdLztcblxuLyoqXG4gKiBFc2NhcGVzIHNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGJ5IENTUyBzZWxlY3RvciBpdGVtcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU2VsZWN0b3JJdGVtKGlucHV0ID0gXCJcIik6IHN0cmluZyB7XG4gIHJldHVybiBDU1M/LmVzY2FwZT8uKGlucHV0KSA/PyBsZWdhY3lTYW5pdGl6ZVNlbGVjdG9ySXRlbShpbnB1dCk7XG59XG5cbi8qKlxuICogTGVnYWN5IHZlcnNpb24gb2YgZXNjYXBpbmcgdXRpbGl0eSwgb3JpZ2luYWxseSB1c2VkIGZvciBJRTExLS4gU2hvdWxkXG4gKiBwcm9iYWJseSBiZSByZXBsYWNlZCBieSBhIHBvbHlmaWxsOlxuICogaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvQ1NTLmVzY2FwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVnYWN5U2FuaXRpemVTZWxlY3Rvckl0ZW0oaW5wdXQgPSBcIlwiKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0XG4gICAgLnNwbGl0KFwiXCIpXG4gICAgLm1hcCgoY2hhcmFjdGVyKSA9PiB7XG4gICAgICBpZiAoY2hhcmFjdGVyID09PSBcIjpcIikge1xuICAgICAgICByZXR1cm4gYFxcXFwke0VTQ0FQRURfQ09MT059IGA7XG4gICAgICB9XG4gICAgICBpZiAoU1BFQ0lBTF9DSEFSQUNURVJTX1JFLnRlc3QoY2hhcmFjdGVyKSkge1xuICAgICAgICByZXR1cm4gYFxcXFwke2NoYXJhY3Rlcn1gO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVzY2FwZShjaGFyYWN0ZXIpLnJlcGxhY2UoLyUvZywgXCJcXFxcXCIpO1xuICAgIH0pXG4gICAgLmpvaW4oXCJcIik7XG59XG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9UWVBFX0dFVFRFUlMgPSB7XG4gIHRhZzogZ2V0VGFnU2VsZWN0b3IsXG4gIGlkOiBnZXRJZFNlbGVjdG9yLFxuICBjbGFzczogZ2V0Q2xhc3NTZWxlY3RvcnMsXG4gIGF0dHJpYnV0ZTogZ2V0QXR0cmlidXRlU2VsZWN0b3JzLFxuICBudGhjaGlsZDogZ2V0TnRoQ2hpbGRTZWxlY3RvcixcbiAgbnRob2Z0eXBlOiBnZXROdGhPZlR5cGVTZWxlY3Rvcixcbn07XG5cbmV4cG9ydCBjb25zdCBFTEVNRU5UX1NFTEVDVE9SX1RZUEVfR0VUVEVSUyA9IHtcbiAgdGFnOiBnZXRFbGVtZW50VGFnU2VsZWN0b3JzLFxuICBpZDogZ2V0RWxlbWVudElkU2VsZWN0b3JzLFxuICBjbGFzczogZ2V0RWxlbWVudENsYXNzU2VsZWN0b3JzLFxuICBhdHRyaWJ1dGU6IGdldEVsZW1lbnRBdHRyaWJ1dGVTZWxlY3RvcnMsXG4gIG50aGNoaWxkOiBnZXRFbGVtZW50TnRoQ2hpbGRTZWxlY3RvcixcbiAgbnRob2Z0eXBlOiBnZXRFbGVtZW50TnRoT2ZUeXBlU2VsZWN0b3IsXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgc2VsZWN0b3Igb2YgZ2l2ZW4gdHlwZSBmb3Igc2luZ2xlIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50U2VsZWN0b3JzQnlUeXBlKFxuICBlbGVtZW50OiBFbGVtZW50LFxuICBzZWxlY3RvclR5cGU6IENzc1NlbGVjdG9yVHlwZSxcbik6IENzc1NlbGVjdG9yR2VuZXJhdGVkW10ge1xuICByZXR1cm4gRUxFTUVOVF9TRUxFQ1RPUl9UWVBFX0dFVFRFUlNbc2VsZWN0b3JUeXBlXShlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGxpc3Qgb2Ygc2VsZWN0b3JzIG9mIGdpdmVuIHR5cGUgZm9yIHRoZSBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0b3JzQnlUeXBlKFxuICBlbGVtZW50czogRWxlbWVudFtdLFxuICBzZWxlY3Rvcl90eXBlOiBDc3NTZWxlY3RvclR5cGUsXG4pOiBBcnJheTxDc3NTZWxlY3Rvcj4ge1xuICBjb25zdCBnZXR0ZXIgPVxuICAgIFNFTEVDVE9SX1RZUEVfR0VUVEVSU1tzZWxlY3Rvcl90eXBlXSA/PyAoKCk6IEFycmF5PENzc1NlbGVjdG9yPiA9PiBbXSk7XG4gIHJldHVybiBnZXR0ZXIoZWxlbWVudHMpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBibGFja2xpc3RlZCBzZWxlY3RvcnMgZnJvbSBsaXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyU2VsZWN0b3JzKFxuICBsaXN0OiBBcnJheTxDc3NTZWxlY3Rvcj4gPSBbXSxcbiAgbWF0Y2hCbGFja2xpc3Q6IFBhdHRlcm5NYXRjaGVyLFxuICBtYXRjaFdoaXRlbGlzdDogUGF0dGVybk1hdGNoZXIsXG4pOiBBcnJheTxDc3NTZWxlY3Rvcj4ge1xuICByZXR1cm4gbGlzdC5maWx0ZXIoKGl0ZW0pID0+IG1hdGNoV2hpdGVsaXN0KGl0ZW0pIHx8ICFtYXRjaEJsYWNrbGlzdChpdGVtKSk7XG59XG5cbi8qKlxuICogUHJpb3JpdGlzZSB3aGl0ZWxpc3RlZCBzZWxlY3RvcnMgaW4gbGlzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9yZGVyU2VsZWN0b3JzKFxuICBsaXN0OiBBcnJheTxDc3NTZWxlY3Rvcj4gPSBbXSxcbiAgbWF0Y2hXaGl0ZWxpc3Q6IFBhdHRlcm5NYXRjaGVyLFxuKTogQXJyYXk8Q3NzU2VsZWN0b3I+IHtcbiAgcmV0dXJuIGxpc3Quc29ydCgoYSwgYikgPT4ge1xuICAgIGNvbnN0IGFfaXNfd2hpdGVsaXN0ZWQgPSBtYXRjaFdoaXRlbGlzdChhKTtcbiAgICBjb25zdCBiX2lzX3doaXRlbGlzdGVkID0gbWF0Y2hXaGl0ZWxpc3QoYik7XG4gICAgaWYgKGFfaXNfd2hpdGVsaXN0ZWQgJiYgIWJfaXNfd2hpdGVsaXN0ZWQpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgaWYgKCFhX2lzX3doaXRlbGlzdGVkICYmIGJfaXNfd2hpdGVsaXN0ZWQpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBsaXN0IG9mIHVuaXF1ZSBzZWxlY3RvcnMgYXBwbGljYWJsZSB0byBnaXZlbiBlbGVtZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsU2VsZWN0b3JzKFxuICBlbGVtZW50czogRWxlbWVudFtdLFxuICByb290OiBQYXJlbnROb2RlLFxuICBvcHRpb25zOiBDc3NTZWxlY3RvckdlbmVyYXRvck9wdGlvbnMsXG4pOiBBcnJheTxDc3NTZWxlY3Rvcj4ge1xuICBjb25zdCBzZWxlY3RvcnNfbGlzdCA9IGdldFNlbGVjdG9yc0xpc3QoZWxlbWVudHMsIG9wdGlvbnMpO1xuICBjb25zdCB0eXBlX2NvbWJpbmF0aW9ucyA9IGdldFR5cGVDb21iaW5hdGlvbnMoc2VsZWN0b3JzX2xpc3QsIG9wdGlvbnMpO1xuICBjb25zdCBhbGxfc2VsZWN0b3JzID0gZmxhdHRlbkFycmF5KHR5cGVfY29tYmluYXRpb25zKTtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KGFsbF9zZWxlY3RvcnMpXTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIG9iamVjdCBjb250YWluaW5nIGFsbCBzZWxlY3RvciB0eXBlcyBhbmQgdGhlaXIgcG90ZW50aWFsIHZhbHVlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdG9yc0xpc3QoXG4gIGVsZW1lbnRzOiBFbGVtZW50W10sXG4gIG9wdGlvbnM6IENzc1NlbGVjdG9yR2VuZXJhdG9yT3B0aW9ucyxcbik6IENzc1NlbGVjdG9yRGF0YSB7XG4gIGNvbnN0IHsgYmxhY2tsaXN0LCB3aGl0ZWxpc3QsIGNvbWJpbmVXaXRoaW5TZWxlY3RvciwgbWF4Q29tYmluYXRpb25zIH0gPVxuICAgIG9wdGlvbnM7XG5cbiAgY29uc3QgbWF0Y2hCbGFja2xpc3QgPSBjcmVhdGVQYXR0ZXJuTWF0Y2hlcihibGFja2xpc3QpO1xuICBjb25zdCBtYXRjaFdoaXRlbGlzdCA9IGNyZWF0ZVBhdHRlcm5NYXRjaGVyKHdoaXRlbGlzdCk7XG5cbiAgY29uc3QgcmVkdWNlciA9IChkYXRhOiBDc3NTZWxlY3RvckRhdGEsIHNlbGVjdG9yX3R5cGU6IENzc1NlbGVjdG9yVHlwZSkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdG9yc19ieV90eXBlID0gZ2V0U2VsZWN0b3JzQnlUeXBlKGVsZW1lbnRzLCBzZWxlY3Rvcl90eXBlKTtcbiAgICBjb25zdCBmaWx0ZXJlZF9zZWxlY3RvcnMgPSBmaWx0ZXJTZWxlY3RvcnMoXG4gICAgICBzZWxlY3RvcnNfYnlfdHlwZSxcbiAgICAgIG1hdGNoQmxhY2tsaXN0LFxuICAgICAgbWF0Y2hXaGl0ZWxpc3QsXG4gICAgKTtcbiAgICBjb25zdCBmb3VuZF9zZWxlY3RvcnMgPSBvcmRlclNlbGVjdG9ycyhmaWx0ZXJlZF9zZWxlY3RvcnMsIG1hdGNoV2hpdGVsaXN0KTtcblxuICAgIGRhdGFbc2VsZWN0b3JfdHlwZV0gPSBjb21iaW5lV2l0aGluU2VsZWN0b3JcbiAgICAgID8gZ2V0UG93ZXJTZXQoZm91bmRfc2VsZWN0b3JzLCB7IG1heFJlc3VsdHM6IG1heENvbWJpbmF0aW9ucyB9KVxuICAgICAgOiBmb3VuZF9zZWxlY3RvcnMubWFwKChpdGVtKSA9PiBbaXRlbV0pO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG5cbiAgcmV0dXJuIGdldFNlbGVjdG9yc1RvR2V0KG9wdGlvbnMpLnJlZHVjZShyZWR1Y2VyLCB7fSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBsaXN0IG9mIHNlbGVjdG9yIHR5cGVzIHRoYXQgd2Ugd2lsbCBuZWVkIHRvIGdlbmVyYXRlIHRoZSBzZWxlY3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdG9yc1RvR2V0KFxuICBvcHRpb25zOiBDc3NTZWxlY3RvckdlbmVyYXRvck9wdGlvbnMsXG4pOiBDc3NTZWxlY3RvclR5cGVzIHtcbiAgY29uc3QgeyBzZWxlY3RvcnMsIGluY2x1ZGVUYWcgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3Qgc2VsZWN0b3JzX3RvX2dldCA9IFtdLmNvbmNhdChzZWxlY3RvcnMpO1xuICBpZiAoaW5jbHVkZVRhZyAmJiAhc2VsZWN0b3JzX3RvX2dldC5pbmNsdWRlcyhcInRhZ1wiKSkge1xuICAgIHNlbGVjdG9yc190b19nZXQucHVzaChcInRhZ1wiKTtcbiAgfVxuICByZXR1cm4gc2VsZWN0b3JzX3RvX2dldDtcbn1cblxuLyoqXG4gKiBBZGRzIFwidGFnXCIgdG8gYSBsaXN0LCBpZiBpdCBkb2VzIG5vdCBjb250YWluIGl0LiBVc2VkIHRvIG1vZGlmeSBzZWxlY3RvcnNcbiAqIGxpc3Qgd2hlbiBpbmNsdWRlVGFnIG9wdGlvbiBpcyBlbmFibGVkIHRvIG1ha2Ugc3VyZSBhbGwgcmVzdWx0cyBjb250YWluIHRoZVxuICogVEFHIHBhcnQuXG4gKi9cbmZ1bmN0aW9uIGFkZFRhZ1R5cGVJZk5lZWRlZChsaXN0OiBDc3NTZWxlY3RvclR5cGVzKTogQ3NzU2VsZWN0b3JUeXBlcyB7XG4gIHJldHVybiBsaXN0LmluY2x1ZGVzKENTU19TRUxFQ1RPUl9UWVBFLnRhZykgfHxcbiAgICBsaXN0LmluY2x1ZGVzKENTU19TRUxFQ1RPUl9UWVBFLm50aG9mdHlwZSlcbiAgICA/IFsuLi5saXN0XVxuICAgIDogWy4uLmxpc3QsIENTU19TRUxFQ1RPUl9UWVBFLnRhZ107XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGxpc3Qgb2YgcG9zc2libGUgc2VsZWN0b3IgdHlwZSBjb21iaW5hdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lU2VsZWN0b3JUeXBlcyhcbiAgb3B0aW9uczogQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zLFxuKTogQXJyYXk8Q3NzU2VsZWN0b3JUeXBlcz4ge1xuICBjb25zdCB7IHNlbGVjdG9ycywgY29tYmluZUJldHdlZW5TZWxlY3RvcnMsIGluY2x1ZGVUYWcsIG1heENhbmRpZGF0ZXMgfSA9XG4gICAgb3B0aW9ucztcblxuICBjb25zdCBjb21iaW5hdGlvbnMgPSBjb21iaW5lQmV0d2VlblNlbGVjdG9yc1xuICAgID8gZ2V0UG93ZXJTZXQoc2VsZWN0b3JzLCB7IG1heFJlc3VsdHM6IG1heENhbmRpZGF0ZXMgfSlcbiAgICA6IHNlbGVjdG9ycy5tYXAoKGl0ZW0pID0+IFtpdGVtXSk7XG5cbiAgcmV0dXJuIGluY2x1ZGVUYWcgPyBjb21iaW5hdGlvbnMubWFwKGFkZFRhZ1R5cGVJZk5lZWRlZCkgOiBjb21iaW5hdGlvbnM7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGxpc3Qgb2YgY29tYmluZWQgQ1NTIHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVDb21iaW5hdGlvbnMoXG4gIHNlbGVjdG9yc19saXN0OiBDc3NTZWxlY3RvckRhdGEsXG4gIG9wdGlvbnM6IENzc1NlbGVjdG9yR2VuZXJhdG9yT3B0aW9ucyxcbik6IEFycmF5PEFycmF5PENzc1NlbGVjdG9yPj4ge1xuICByZXR1cm4gY29tYmluZVNlbGVjdG9yVHlwZXMob3B0aW9ucylcbiAgICAubWFwKChpdGVtKSA9PiB7XG4gICAgICByZXR1cm4gY29uc3RydWN0U2VsZWN0b3JzKGl0ZW0sIHNlbGVjdG9yc19saXN0KTtcbiAgICB9KVxuICAgIC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0ubGVuZ3RoID4gMCk7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGFsbCB2YXJpYXRpb25zIG9mIHBvc3NpYmxlIHNlbGVjdG9ycyBmcm9tIHByb3ZpZGVkIGRhdGEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdHJ1Y3RTZWxlY3RvcnMoXG4gIHNlbGVjdG9yX3R5cGVzOiBDc3NTZWxlY3RvclR5cGVzLFxuICBzZWxlY3RvcnNfYnlfdHlwZTogQ3NzU2VsZWN0b3JEYXRhLFxuKTogQXJyYXk8Q3NzU2VsZWN0b3I+IHtcbiAgY29uc3QgZGF0YTogQ3NzU2VsZWN0b3JEYXRhID0ge307XG4gIHNlbGVjdG9yX3R5cGVzLmZvckVhY2goKHNlbGVjdG9yX3R5cGUpID0+IHtcbiAgICBjb25zdCBzZWxlY3Rvcl92YXJpYW50cyA9IHNlbGVjdG9yc19ieV90eXBlW3NlbGVjdG9yX3R5cGVdO1xuICAgIGlmIChzZWxlY3Rvcl92YXJpYW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBkYXRhW3NlbGVjdG9yX3R5cGVdID0gc2VsZWN0b3JfdmFyaWFudHM7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBjb21iaW5hdGlvbnMgPSBnZXRDYXJ0ZXNpYW5Qcm9kdWN0PHN0cmluZyB8IHN0cmluZ1tdPihkYXRhKTtcbiAgcmV0dXJuIGNvbWJpbmF0aW9ucy5tYXAoY29uc3RydWN0U2VsZWN0b3IpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgc2VsZWN0b3IgZm9yIGdpdmVuIHNlbGVjdG9yIHR5cGUuIENvbWJpbmVzIHNldmVyYWwgcGFydHMgaWYgbmVlZGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RydWN0U2VsZWN0b3JUeXBlKFxuICBzZWxlY3Rvcl90eXBlOiBDc3NTZWxlY3RvclR5cGUsXG4gIHNlbGVjdG9yc19kYXRhOiBDc3NTZWxlY3RvckRhdGEsXG4pOiBDc3NTZWxlY3RvciB7XG4gIHJldHVybiBzZWxlY3RvcnNfZGF0YVtzZWxlY3Rvcl90eXBlXVxuICAgID8gc2VsZWN0b3JzX2RhdGFbc2VsZWN0b3JfdHlwZV0uam9pbihcIlwiKVxuICAgIDogXCJcIjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBzZWxlY3RvciBkYXRhIG9iamVjdCB0byBhIHNlbGVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RydWN0U2VsZWN0b3IoXG4gIHNlbGVjdG9yRGF0YTogQ3NzU2VsZWN0b3JEYXRhID0ge30sXG4pOiBDc3NTZWxlY3RvciB7XG4gIGNvbnN0IHBhdHRlcm4gPSBbLi4uU0VMRUNUT1JfUEFUVEVSTl07XG4gIC8vIHNlbGVjdG9yIFwibnRob2Z0eXBlXCIgYWxyZWFkeSBjb250YWlucyBcInRhZ1wiXG4gIGlmIChcbiAgICBzZWxlY3RvckRhdGFbQ1NTX1NFTEVDVE9SX1RZUEUudGFnXSAmJlxuICAgIHNlbGVjdG9yRGF0YVtDU1NfU0VMRUNUT1JfVFlQRS5udGhvZnR5cGVdXG4gICkge1xuICAgIHBhdHRlcm4uc3BsaWNlKHBhdHRlcm4uaW5kZXhPZihDU1NfU0VMRUNUT1JfVFlQRS50YWcpLCAxKTtcbiAgfVxuXG4gIHJldHVybiBwYXR0ZXJuXG4gICAgLm1hcCgodHlwZSkgPT4gY29uc3RydWN0U2VsZWN0b3JUeXBlKHR5cGUsIHNlbGVjdG9yRGF0YSkpXG4gICAgLmpvaW4oXCJcIik7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGNvbWJpbmF0aW9ucyBvZiBjaGlsZCBhbmQgZGVzY2VuZGFudCBzZWxlY3RvcnMgd2l0aGluIHJvb3RcbiAqIHNlbGVjdG9yLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUNhbmRpZGF0ZUNvbWJpbmF0aW9ucyhcbiAgc2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdLFxuICByb290U2VsZWN0b3I6IENzc1NlbGVjdG9yLFxuKTogQ3NzU2VsZWN0b3JbXSB7XG4gIHJldHVybiBbXG4gICAgLi4uc2VsZWN0b3JzLm1hcChcbiAgICAgIChzZWxlY3RvcikgPT4gcm9vdFNlbGVjdG9yICsgT1BFUkFUT1IuREVTQ0VOREFOVCArIHNlbGVjdG9yLFxuICAgICksXG4gICAgLi4uc2VsZWN0b3JzLm1hcCgoc2VsZWN0b3IpID0+IHJvb3RTZWxlY3RvciArIE9QRVJBVE9SLkNISUxEICsgc2VsZWN0b3IpLFxuICBdO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGxpc3Qgb2Ygc2VsZWN0b3IgY2FuZGlkYXRlcyB0aGF0IGNhbiBwb3RlbnRpYWxseSBtYXRjaCB0YXJnZXRcbiAqIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQ2FuZGlkYXRlcyhcbiAgc2VsZWN0b3JzOiBDc3NTZWxlY3RvcltdLFxuICByb290U2VsZWN0b3I6IENzc1NlbGVjdG9yLFxuKTogQ3NzU2VsZWN0b3JbXSB7XG4gIHJldHVybiByb290U2VsZWN0b3IgPT09IFwiXCJcbiAgICA/IHNlbGVjdG9yc1xuICAgIDogZ2VuZXJhdGVDYW5kaWRhdGVDb21iaW5hdGlvbnMoc2VsZWN0b3JzLCByb290U2VsZWN0b3IpO1xufVxuXG4vKipcbiAqIFRyaWVzIHRvIGZpbmQgYW4gdW5pcXVlIENTUyBzZWxlY3RvciBmb3IgZWxlbWVudCB3aXRoaW4gZ2l2ZW4gcGFyZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0b3JXaXRoaW5Sb290KFxuICBlbGVtZW50czogRWxlbWVudFtdLFxuICByb290OiBQYXJlbnROb2RlLFxuICByb290U2VsZWN0b3I6IENzc1NlbGVjdG9yID0gXCJcIixcbiAgb3B0aW9uczogQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zLFxuKTogbnVsbCB8IENzc1NlbGVjdG9yIHtcbiAgY29uc3QgZWxlbWVudFNlbGVjdG9ycyA9IGdldEFsbFNlbGVjdG9ycyhlbGVtZW50cywgb3B0aW9ucy5yb290LCBvcHRpb25zKTtcbiAgY29uc3Qgc2VsZWN0b3JDYW5kaWRhdGVzID0gZ2VuZXJhdGVDYW5kaWRhdGVzKGVsZW1lbnRTZWxlY3RvcnMsIHJvb3RTZWxlY3Rvcik7XG4gIGZvciAoY29uc3QgY2FuZGlkYXRlU2VsZWN0b3Igb2Ygc2VsZWN0b3JDYW5kaWRhdGVzKSB7XG4gICAgaWYgKHRlc3RTZWxlY3RvcihlbGVtZW50cywgY2FuZGlkYXRlU2VsZWN0b3IsIG9wdGlvbnMucm9vdCkpIHtcbiAgICAgIHJldHVybiBjYW5kaWRhdGVTZWxlY3RvcjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQ2xpbWJzIHRocm91Z2ggcGFyZW50cyBvZiB0aGUgZWxlbWVudCBhbmQgdHJpZXMgdG8gZmluZCB0aGUgb25lIHRoYXQgaXNcbiAqIGlkZW50aWZpYWJsZSBieSB1bmlxdWUgQ1NTIHNlbGVjdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc2VzdElkZW50aWZpYWJsZVBhcmVudChcbiAgZWxlbWVudHM6IEVsZW1lbnRbXSxcbiAgcm9vdDogUGFyZW50Tm9kZSxcbiAgcm9vdFNlbGVjdG9yOiBDc3NTZWxlY3RvciA9IFwiXCIsXG4gIG9wdGlvbnM6IENzc1NlbGVjdG9yR2VuZXJhdG9yT3B0aW9ucyxcbik6IElkZW50aWZpYWJsZVBhcmVudCB7XG4gIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNhbmRpZGF0ZXNMaXN0ID0gW1xuICAgIGVsZW1lbnRzLmxlbmd0aCA+IDEgPyBlbGVtZW50cyA6IFtdLFxuICAgIC4uLmdldFBhcmVudHMoZWxlbWVudHMsIHJvb3QpLm1hcCgoZWxlbWVudCkgPT4gW2VsZW1lbnRdKSxcbiAgXTtcblxuICBmb3IgKGNvbnN0IGN1cnJlbnRFbGVtZW50cyBvZiBjYW5kaWRhdGVzTGlzdCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGdldFNlbGVjdG9yV2l0aGluUm9vdChcbiAgICAgIGN1cnJlbnRFbGVtZW50cyxcbiAgICAgIHJvb3QsXG4gICAgICByb290U2VsZWN0b3IsXG4gICAgICBvcHRpb25zLFxuICAgICk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZm91bmRFbGVtZW50czogY3VycmVudEVsZW1lbnRzLFxuICAgICAgICBzZWxlY3RvcjogcmVzdWx0LFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBpbnB1dCBpbnRvIGxpc3Qgb2YgZWxlbWVudHMsIHJlbW92aW5nIGR1cGxpY2F0ZXMgYW5kIG5vbi1lbGVtZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplU2VsZWN0b3JOZWVkbGUobmVlZGxlOiB1bmtub3duKTogRWxlbWVudFtdIHtcbiAgaWYgKG5lZWRsZSBpbnN0YW5jZW9mIE5vZGVMaXN0IHx8IG5lZWRsZSBpbnN0YW5jZW9mIEhUTUxDb2xsZWN0aW9uKSB7XG4gICAgbmVlZGxlID0gQXJyYXkuZnJvbShuZWVkbGUpO1xuICB9XG4gIGNvbnN0IGVsZW1lbnRzID0gKEFycmF5LmlzQXJyYXkobmVlZGxlKSA/IG5lZWRsZSA6IFtuZWVkbGVdKS5maWx0ZXIoXG4gICAgaXNFbGVtZW50LFxuICApO1xuICByZXR1cm4gWy4uLm5ldyBTZXQoZWxlbWVudHMpXTtcbn1cbiIsImltcG9ydCB7XG4gIENTU19TRUxFQ1RPUl9UWVBFLFxuICBDc3NTZWxlY3RvckdlbmVyYXRlZCxcbiAgQ3NzU2VsZWN0b3JUeXBlLFxuICBDc3NTZWxlY3RvclR5cGVzLFxuICBFbGVtZW50RGF0YSxcbiAgRWxlbWVudFNlbGVjdG9yRGF0YSxcbiAgT1BFUkFUT1IsXG4gIE9wZXJhdG9yVmFsdWUsXG59IGZyb20gXCIuL3R5cGVzLmpzXCI7XG5pbXBvcnQgeyBTRUxFQ1RPUl9QQVRURVJOIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgeyBnZXRFbGVtZW50U2VsZWN0b3JzQnlUeXBlIH0gZnJvbSBcIi4vdXRpbGl0aWVzLXNlbGVjdG9ycy5qc1wiO1xuXG4vKipcbiAqIENyZWF0ZXMgZGF0YSBkZXNjcmliaW5nIGEgc3BlY2lmaWMgc2VsZWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50U2VsZWN0b3JEYXRhKFxuICBzZWxlY3RvcjogQ3NzU2VsZWN0b3JHZW5lcmF0ZWQsXG4pOiBFbGVtZW50U2VsZWN0b3JEYXRhIHtcbiAgcmV0dXJuIHtcbiAgICB2YWx1ZTogc2VsZWN0b3IsXG4gICAgaW5jbHVkZTogZmFsc2UsXG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBkYXRhIGRlc2NyaWJpbmcgYW4gZWxlbWVudCB3aXRoaW4gQ3NzU2VsZWN0b3IgY2hhaW4uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50RGF0YShcbiAgZWxlbWVudDogRWxlbWVudCxcbiAgc2VsZWN0b3JUeXBlczogQ3NzU2VsZWN0b3JUeXBlcyxcbiAgb3BlcmF0b3I6IE9wZXJhdG9yVmFsdWUgPSBPUEVSQVRPUi5OT05FLFxuKTogRWxlbWVudERhdGEge1xuICBjb25zdCBzZWxlY3RvcnMgPSB7fTtcbiAgc2VsZWN0b3JUeXBlcy5mb3JFYWNoKChzZWxlY3RvclR5cGUpID0+IHtcbiAgICBSZWZsZWN0LnNldChcbiAgICAgIHNlbGVjdG9ycyxcbiAgICAgIHNlbGVjdG9yVHlwZSxcbiAgICAgIGdldEVsZW1lbnRTZWxlY3RvcnNCeVR5cGUoZWxlbWVudCwgc2VsZWN0b3JUeXBlKS5tYXAoXG4gICAgICAgIGNyZWF0ZUVsZW1lbnRTZWxlY3RvckRhdGEsXG4gICAgICApLFxuICAgICk7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIGVsZW1lbnQsXG4gICAgb3BlcmF0b3IsXG4gICAgc2VsZWN0b3JzLFxuICB9O1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgc2VsZWN0b3IgZnJvbSBlbGVtZW50IGRhdGEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdHJ1Y3RFbGVtZW50U2VsZWN0b3Ioe1xuICBzZWxlY3RvcnMsXG4gIG9wZXJhdG9yLFxufTogRWxlbWVudERhdGEpOiBDc3NTZWxlY3RvckdlbmVyYXRlZCB7XG4gIGxldCBwYXR0ZXJuID0gWy4uLlNFTEVDVE9SX1BBVFRFUk5dO1xuICAvLyBgbnRob2Z0eXBlYCBhbHJlYWR5IGNvbnRhaW5zIHRhZ1xuICBpZiAoXG4gICAgc2VsZWN0b3JzW0NTU19TRUxFQ1RPUl9UWVBFLnRhZ10gJiZcbiAgICBzZWxlY3RvcnNbQ1NTX1NFTEVDVE9SX1RZUEUubnRob2Z0eXBlXVxuICApIHtcbiAgICBwYXR0ZXJuID0gcGF0dGVybi5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0gIT09IENTU19TRUxFQ1RPUl9UWVBFLnRhZyk7XG4gIH1cblxuICBsZXQgc2VsZWN0b3IgPSBcIlwiO1xuICBwYXR0ZXJuLmZvckVhY2goKHNlbGVjdG9yVHlwZSkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdG9yc09mVHlwZSA9IHNlbGVjdG9yc1tzZWxlY3RvclR5cGVdIHx8IFtdO1xuICAgIHNlbGVjdG9yc09mVHlwZS5mb3JFYWNoKCh7IHZhbHVlLCBpbmNsdWRlIH0pID0+IHtcbiAgICAgIGlmIChpbmNsdWRlKSB7XG4gICAgICAgIHNlbGVjdG9yICs9IHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gKG9wZXJhdG9yICsgc2VsZWN0b3IpIGFzIENzc1NlbGVjdG9yR2VuZXJhdGVkO1xufVxuIiwiaW1wb3J0IHsgZ2V0RWxlbWVudFBhcmVudHMgfSBmcm9tIFwiLi91dGlsaXRpZXMtZG9tLmpzXCI7XG5pbXBvcnQgeyBTRUxFQ1RPUl9TRVBBUkFUT1IgfSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcbmltcG9ydCB7XG4gIENTU19TRUxFQ1RPUl9UWVBFLFxuICBDc3NTZWxlY3RvcixcbiAgQ3NzU2VsZWN0b3JUeXBlLFxuICBPUEVSQVRPUixcbn0gZnJvbSBcIi4vdHlwZXMuanNcIjtcbmltcG9ydCB7XG4gIGNvbnN0cnVjdEVsZW1lbnRTZWxlY3RvcixcbiAgY3JlYXRlRWxlbWVudERhdGEsXG59IGZyb20gXCIuL3V0aWxpdGllcy1lbGVtZW50LWRhdGEuanNcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGZhbGxiYWNrIHNlbGVjdG9yIGZvciBzaW5nbGUgZWxlbWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRGYWxsYmFja1NlbGVjdG9yKGVsZW1lbnQ6IEVsZW1lbnQpOiBDc3NTZWxlY3RvciB7XG4gIGNvbnN0IHBhcmVudEVsZW1lbnRzID0gZ2V0RWxlbWVudFBhcmVudHMoZWxlbWVudCkucmV2ZXJzZSgpO1xuICBjb25zdCBlbGVtZW50c0RhdGEgPSBwYXJlbnRFbGVtZW50cy5tYXAoKGVsZW1lbnQpID0+IHtcbiAgICBjb25zdCBlbGVtZW50RGF0YSA9IGNyZWF0ZUVsZW1lbnREYXRhKFxuICAgICAgZWxlbWVudCxcbiAgICAgIFtDU1NfU0VMRUNUT1JfVFlQRS5udGhjaGlsZF0sXG4gICAgICBPUEVSQVRPUi5DSElMRCxcbiAgICApO1xuICAgIGVsZW1lbnREYXRhLnNlbGVjdG9ycy5udGhjaGlsZC5mb3JFYWNoKChzZWxlY3RvckRhdGEpID0+IHtcbiAgICAgIHNlbGVjdG9yRGF0YS5pbmNsdWRlID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gZWxlbWVudERhdGE7XG4gIH0pO1xuXG4gIHJldHVybiBbXCI6cm9vdFwiLCAuLi5lbGVtZW50c0RhdGEubWFwKGNvbnN0cnVjdEVsZW1lbnRTZWxlY3RvcildLmpvaW4oXCJcIik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBjaGFpbiBvZiA6bnRoLWNoaWxkIHNlbGVjdG9ycyBmcm9tIHJvb3QgdG8gdGhlIGVsZW1lbnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmFsbGJhY2tTZWxlY3RvcihlbGVtZW50czogRWxlbWVudFtdKTogQ3NzU2VsZWN0b3Ige1xuICByZXR1cm4gZWxlbWVudHMubWFwKGdldEVsZW1lbnRGYWxsYmFja1NlbGVjdG9yKS5qb2luKFNFTEVDVE9SX1NFUEFSQVRPUik7XG59XG4iLCJpbXBvcnQgeyBnZXRGYWxsYmFja1NlbGVjdG9yIH0gZnJvbSBcIi4vc2VsZWN0b3ItZmFsbGJhY2suanNcIjtcbmltcG9ydCB7IHNhbml0aXplT3B0aW9ucyB9IGZyb20gXCIuL3V0aWxpdGllcy1vcHRpb25zLmpzXCI7XG5pbXBvcnQge1xuICBnZXRDbG9zZXN0SWRlbnRpZmlhYmxlUGFyZW50LFxuICBzYW5pdGl6ZVNlbGVjdG9yTmVlZGxlLFxufSBmcm9tIFwiLi91dGlsaXRpZXMtc2VsZWN0b3JzLmpzXCI7XG5pbXBvcnQgeyBDc3NTZWxlY3RvciwgQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zSW5wdXQgfSBmcm9tIFwiLi90eXBlcy5qc1wiO1xuaW1wb3J0IHsgdGVzdFNlbGVjdG9yIH0gZnJvbSBcIi4vdXRpbGl0aWVzLWRvbS5qc1wiO1xuaW1wb3J0IHsgU0VMRUNUT1JfU0VQQVJBVE9SIH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5cbi8qKlxuICogR2VuZXJhdGVzIHVuaXF1ZSBDU1Mgc2VsZWN0b3IgZm9yIGFuIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDc3NTZWxlY3RvcihcbiAgbmVlZGxlOiB1bmtub3duLFxuICBjdXN0b21fb3B0aW9uczogQ3NzU2VsZWN0b3JHZW5lcmF0b3JPcHRpb25zSW5wdXQgPSB7fSxcbik6IENzc1NlbGVjdG9yIHtcbiAgY29uc3QgZWxlbWVudHMgPSBzYW5pdGl6ZVNlbGVjdG9yTmVlZGxlKG5lZWRsZSk7XG4gIGNvbnN0IG9wdGlvbnMgPSBzYW5pdGl6ZU9wdGlvbnMoZWxlbWVudHNbMF0sIGN1c3RvbV9vcHRpb25zKTtcbiAgbGV0IHBhcnRpYWxTZWxlY3RvciA9IFwiXCI7XG4gIGxldCBjdXJyZW50Um9vdCA9IG9wdGlvbnMucm9vdDtcblxuICAvKipcbiAgICogVXRpbGl0eSBmdW5jdGlvbiB0byBtYWtlIHN1YnNlcXVlbnQgY2FsbHMgc2hvcnRlci5cbiAgICovXG4gIGZ1bmN0aW9uIHVwZGF0ZUlkZW50aWZpYWJsZVBhcmVudCgpIHtcbiAgICByZXR1cm4gZ2V0Q2xvc2VzdElkZW50aWZpYWJsZVBhcmVudChcbiAgICAgIGVsZW1lbnRzLFxuICAgICAgY3VycmVudFJvb3QsXG4gICAgICBwYXJ0aWFsU2VsZWN0b3IsXG4gICAgICBvcHRpb25zLFxuICAgICk7XG4gIH1cblxuICBsZXQgY2xvc2VzdElkZW50aWZpYWJsZVBhcmVudCA9IHVwZGF0ZUlkZW50aWZpYWJsZVBhcmVudCgpO1xuICB3aGlsZSAoY2xvc2VzdElkZW50aWZpYWJsZVBhcmVudCkge1xuICAgIGNvbnN0IHsgZm91bmRFbGVtZW50cywgc2VsZWN0b3IgfSA9IGNsb3Nlc3RJZGVudGlmaWFibGVQYXJlbnQ7XG4gICAgaWYgKHRlc3RTZWxlY3RvcihlbGVtZW50cywgc2VsZWN0b3IsIG9wdGlvbnMucm9vdCkpIHtcbiAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICB9XG4gICAgY3VycmVudFJvb3QgPSBmb3VuZEVsZW1lbnRzWzBdO1xuICAgIHBhcnRpYWxTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIGNsb3Nlc3RJZGVudGlmaWFibGVQYXJlbnQgPSB1cGRhdGVJZGVudGlmaWFibGVQYXJlbnQoKTtcbiAgfVxuXG4gIC8vIGlmIGZhaWxlZCB0byBmaW5kIHNpbmdsZSBzZWxlY3RvciBtYXRjaGluZyBhbGwgZWxlbWVudHMsIHRyeSB0byBmaW5kXG4gIC8vIHNlbGVjdG9yIGZvciBlYWNoIHN0YW5kYWxvbmUgZWxlbWVudCBhbmQgam9pbiB0aGVtIHRvZ2V0aGVyXG4gIGlmIChlbGVtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRzXG4gICAgICAubWFwKChlbGVtZW50KSA9PiBnZXRDc3NTZWxlY3RvcihlbGVtZW50LCBvcHRpb25zKSlcbiAgICAgIC5qb2luKFNFTEVDVE9SX1NFUEFSQVRPUik7XG4gIH1cblxuICByZXR1cm4gZ2V0RmFsbGJhY2tTZWxlY3RvcihlbGVtZW50cyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldENzc1NlbGVjdG9yO1xuIiwiLyoqIGFsZ29yaXRobXMgZm9yIHByZS13ZWJzaXRlIGV4ZWN1dGlvbiBjb2RlIGluamVjdGlvbjsgYWxsb3dzIGZvciBhbGwga2luZHMgb2Ygc3Bvb2t5IG1hZ2ljIDspICovXG5pbXBvcnQgeyBnZXRDc3NTZWxlY3RvciB9IGZyb20gXCJjc3Mtc2VsZWN0b3ItZ2VuZXJhdG9yXCI7XG5pbXBvcnQgeyBwcmVmUGVyUGFnZSB9IGZyb20gXCIuL2xpYi9jb250ZW50LXNjcmlwdC9wcmVmc1wiO1xuXG4vLyBFeHRlbmQgdGhlIFdpbmRvdyBpbnRlcmZhY2UgdG8gaW5jbHVkZSAkJF9mdHJFdmVudExpc3RlbmVyc01hcFxuZGVjbGFyZSBnbG9iYWwge1xuICBpbnRlcmZhY2UgSFRNTEVsZW1lbnQge1xuICAgICQkX2Z0ckV2ZW50TGlzdGVuZXJzTWFwOiBNYXA8XG4gICAgICBFdmVudFRhcmdldCxcbiAgICAgIE1hcDxzdHJpbmcsIEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3RbXT5cbiAgICA+O1xuICAgICQkX2Z0ck1lZGlhRWxlbWVudHM6IEFycmF5PHN0cmluZz47XG4gIH1cbn1cblxuY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgLy8gRW5zdXJlIHRoZSBnbG9iYWwgbWFwIGV4aXN0cyBvbiB0aGUgd2luZG93IG9iamVjdFxuICBpZiAoZG9jdW1lbnQuYm9keSAmJiAhZG9jdW1lbnQuYm9keS4kJF9mdHJFdmVudExpc3RlbmVyc01hcCkge1xuICAgIChkb2N1bWVudC5ib2R5IGFzIGFueSkuJCRfZnRyRXZlbnRMaXN0ZW5lcnNNYXAgPSBuZXcgTWFwPFxuICAgICAgRXZlbnRUYXJnZXQsXG4gICAgICBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0W10+XG4gICAgPigpO1xuICB9XG4gIGlmIChkb2N1bWVudC5ib2R5ICYmICFkb2N1bWVudC5ib2R5LiQkX2Z0ck1lZGlhRWxlbWVudHMpIHtcbiAgICAoZG9jdW1lbnQuYm9keSBhcyBhbnkpLiQkX2Z0ck1lZGlhRWxlbWVudHMgPSBbXTtcbiAgfVxufTtcblxuLy8gQ29ycmVjdGVkIGltcGxlbWVudGF0aW9uIGZvciBhZGRFdmVudExpc3RlbmVyIGFuZCByZW1vdmVFdmVudExpc3RlbmVyXG4vKlxuY29uc3Qgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyID0gRXZlbnRUYXJnZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5jb25zdCBvcmlnaW5hbFJlbW92ZUV2ZW50TGlzdGVuZXIgPSBFdmVudFRhcmdldC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuRXZlbnRUYXJnZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LCBvcHRpb25zPzogYm9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdm9pZCB7XG5cbiAgICAvL2NvbnNvbGUubG9nKCdhZGRFdmVudExpc3RlbmVyIGNhbGxlZCcsIHRoaXMsIGxpc3RlbmVyLCB0eXBlLCBvcHRpb25zKVxuICAgIC8vaW5pdCgpO1xuXG4gICAgbGV0IGxpc3RlbmVyc0ZvckVsZW1lbnQgPSBkb2N1bWVudC5ib2R5LiQkX2Z0ckV2ZW50TGlzdGVuZXJzTWFwLmdldCh0aGlzKTtcbiAgICBpZiAoIWxpc3RlbmVyc0ZvckVsZW1lbnQpIHtcbiAgICAgICAgbGlzdGVuZXJzRm9yRWxlbWVudCA9IG5ldyBNYXA8c3RyaW5nLCBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0W10+KCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuJCRfZnRyRXZlbnRMaXN0ZW5lcnNNYXAuc2V0KHRoaXMsIGxpc3RlbmVyc0ZvckVsZW1lbnQpO1xuICAgIH1cblxuICAgIGxldCBsaXN0ZW5lcnNGb3JUeXBlID0gbGlzdGVuZXJzRm9yRWxlbWVudC5nZXQodHlwZSk7XG4gICAgaWYgKCFsaXN0ZW5lcnNGb3JUeXBlKSB7XG4gICAgICAgIGxpc3RlbmVyc0ZvclR5cGUgPSBbXTtcbiAgICAgICAgbGlzdGVuZXJzRm9yRWxlbWVudC5zZXQodHlwZSwgbGlzdGVuZXJzRm9yVHlwZSk7XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzRm9yVHlwZS5wdXNoKGxpc3RlbmVyKTsgLy8gQ29ycmVjdCB1c2FnZSBvZiBwdXNoIGZvciBhbiBhcnJheVxuXG4gICAgb3JpZ2luYWxBZGRFdmVudExpc3RlbmVyLmNhbGwodGhpcywgdHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xufTtcblxuRXZlbnRUYXJnZXQucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlOiBzdHJpbmcsIGxpc3RlbmVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0LCBvcHRpb25zPzogYm9vbGVhbiB8IEV2ZW50TGlzdGVuZXJPcHRpb25zKTogdm9pZCB7XG5cbiAgICAvL2luaXQoKTtcblxuICAgIGNvbnN0IGxpc3RlbmVyc0ZvckVsZW1lbnQgPSBkb2N1bWVudC5ib2R5LiQkX2Z0ckV2ZW50TGlzdGVuZXJzTWFwLmdldCh0aGlzKTtcbiAgICBpZiAobGlzdGVuZXJzRm9yRWxlbWVudCkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnNGb3JUeXBlID0gbGlzdGVuZXJzRm9yRWxlbWVudC5nZXQodHlwZSk7XG4gICAgICAgIGlmIChsaXN0ZW5lcnNGb3JUeXBlKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGxpc3RlbmVyc0ZvclR5cGUuZmluZEluZGV4KGwgPT4gbCA9PT0gbGlzdGVuZXIpO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyc0ZvclR5cGUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyc0ZvclR5cGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzRm9yRWxlbWVudC5kZWxldGUodHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXJzRm9yRWxlbWVudC5zaXplID09PSAwKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LiQkX2Z0ckV2ZW50TGlzdGVuZXJzTWFwLmRlbGV0ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9yaWdpbmFsUmVtb3ZlRXZlbnRMaXN0ZW5lci5jYWxsKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKTtcbn07XG4qL1xuXG5jb25zdCBicm9hZGNhc3RNZWRpYUVsZW1lbnRTZWxlY3RvcnMgPSAoKSA9PiB7XG4gIHByZWZQZXJQYWdlPEFycmF5PHN0cmluZz4+KFwibWVkaWFFbGVtZW50c1wiLCBbXSkuc2V0KFxuICAgIGRvY3VtZW50LmJvZHkuJCRfZnRyTWVkaWFFbGVtZW50cyxcbiAgKTtcbn07XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgaW5pdCgpO1xuXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJhdWRpbywgdmlkZW9cIikuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgIGRvY3VtZW50LmJvZHkuJCRfZnRyTWVkaWFFbGVtZW50cy5wdXNoKFxuICAgICAgZ2V0Q3NzU2VsZWN0b3IoZWxlbWVudCBhcyBIVE1MTWVkaWFFbGVtZW50KSxcbiAgICApO1xuICB9KTtcbiAgYnJvYWRjYXN0TWVkaWFFbGVtZW50U2VsZWN0b3JzKCk7XG5cbiAgLy8gRnVuY3Rpb24gdG8gaGFuZGxlIG11dGF0aW9uc1xuICBjb25zdCBoYW5kbGVNdXRhdGlvbnM6IE11dGF0aW9uQ2FsbGJhY2sgPSAobXV0YXRpb25zTGlzdCkgPT4ge1xuICAgIGZvciAoY29uc3QgbXV0YXRpb24gb2YgbXV0YXRpb25zTGlzdCkge1xuICAgICAgLy8gQ2hlY2sgZm9yIGFkZGVkIG5vZGVzXG4gICAgICBpZiAobXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgbXV0YXRpb24uYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGFkZGVkIG5vZGUgaXMgYW4gYXVkaW8gb3IgdmlkZW8gZWxlbWVudFxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIG5vZGUgaW5zdGFuY2VvZiBIVE1MQXVkaW9FbGVtZW50IHx8XG4gICAgICAgICAgICBub2RlIGluc3RhbmNlb2YgSFRNTFZpZGVvRWxlbWVudFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgIGAke1xuICAgICAgICAgICAgICAgIG5vZGUgaW5zdGFuY2VvZiBIVE1MQXVkaW9FbGVtZW50ID8gXCJhdWRpb1wiIDogXCJ2aWRlb1wiXG4gICAgICAgICAgICAgIH0gYXBwZW5kZWRgLFxuICAgICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS4kJF9mdHJNZWRpYUVsZW1lbnRzLnB1c2goXG4gICAgICAgICAgICAgIGdldENzc1NlbGVjdG9yKG5vZGUgYXMgSFRNTEVsZW1lbnQpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyb2FkY2FzdE1lZGlhRWxlbWVudFNlbGVjdG9ycygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIENyZWF0ZSBhIG5ldyBNdXRhdGlvbk9ic2VydmVyIGluc3RhbmNlXG4gIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoaGFuZGxlTXV0YXRpb25zKTtcblxuICAvLyBPcHRpb25zIGZvciB0aGUgb2JzZXJ2ZXIgKHdoaWNoIG11dGF0aW9ucyB0byBvYnNlcnZlKVxuICBjb25zdCBjb25maWcgPSB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9O1xuXG4gIC8vIFN0YXJ0IG9ic2VydmluZyB0aGUgZG9jdW1lbnQgYm9keSBmb3IgRE9NIG11dGF0aW9uc1xuICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIGNvbmZpZyk7XG59KTtcbiJdLCJuYW1lcyI6WyJlbGVtZW50Il0sIm1hcHBpbmdzIjoiOztBQUdNLFNBQVUsVUFBVSxPQUFjO0FBQ3RDLFNBQ0UsT0FBTyxVQUFVLFlBQ2pCLFVBQVUsUUFDVCxNQUFrQixhQUFhLEtBQUs7QUFFekM7QUNJTyxNQUFNLFdBQVc7QUFBQSxFQUN0QixNQUFNO0FBQUEsRUFDTixZQUFZO0FBQUEsRUFDWixPQUFPOztBQXNCRixNQUFNLG9CQUFvQjtBQUFBLEVBQy9CLElBQUk7QUFBQSxFQUNKLE9BQU87QUFBQSxFQUNQLEtBQUs7QUFBQSxFQUNMLFdBQVc7QUFBQSxFQUNYLFVBQVU7QUFBQSxFQUNWLFdBQVc7O0FDekNHLFNBQUEsWUFDZCxVQUNBLFFBQWU7QUFFZixTQUFPLE9BQU8sT0FBTyxRQUFRLEVBQUUsU0FBUyxNQUFNO0FBQ2hEO0FDUkEsTUFBTSxjQUFjO0FBS2QsU0FBVSxZQUFZLEtBQUssc0JBQXNCLE1BQWU7QUFFcEUsVUFBUSxLQUFLLEdBQUcsV0FBVyxLQUFLLEVBQUUsSUFBSSxHQUFHLElBQUk7QUFDL0M7QUNDTyxNQUFNLGtCQUFrQjtBQUFBLEVBQzdCLFdBQVc7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QUFDcEMsUUFBSSxhQUFhLFVBQVUsVUFBVSxRQUFRLElBQUksR0FBRztBQUNsRCxhQUFPO0FBQUEsSUFDUjtBQUNELGtCQUFjLGNBQWMsQ0FBQztBQUM3QixzQkFBa0I7QUFDbEIsZ0NBQTRCLHlCQUF3QjtBQUFBLEVBQ3JEO0FBSUQsTUFBSSxTQUFTLFNBQVMsR0FBRztBQUN2QixXQUFPLFNBQ0osSUFBSSxDQUFDLFlBQVksZUFBZSxTQUFTLE9BQU8sQ0FBQyxFQUNqRCxLQUFLLGtCQUFrQjtBQUFBLEVBQzNCO0FBRUQsU0FBTyxvQkFBb0IsUUFBUTtBQUNyQztBQ3ZDQSxNQUFNLE9BQU8sTUFBTTtBQUVqQixNQUFJLFNBQVMsUUFBUSxDQUFDLFNBQVMsS0FBSyx5QkFBeUI7QUFDMUQsYUFBUyxLQUFhLDBCQUEwQixvQkFBSSxJQUduRDtBQUFBLEVBQ0o7QUFDQSxNQUFJLFNBQVMsUUFBUSxDQUFDLFNBQVMsS0FBSyxxQkFBcUI7QUFDdEQsYUFBUyxLQUFhLHNCQUFzQjtFQUMvQztBQUNGO0FBd0RBLE1BQU0saUNBQWlDLE1BQU07QUFDaEIsY0FBQSxpQkFBaUIsQ0FBRSxDQUFBLEVBQUU7QUFBQSxJQUM5QyxTQUFTLEtBQUs7QUFBQSxFQUFBO0FBRWxCO0FBRUEsU0FBUyxpQkFBaUIsb0JBQW9CLE1BQU07QUFDN0M7QUFFTCxXQUFTLGlCQUFpQixjQUFjLEVBQUUsUUFBUSxDQUFDLFlBQVk7QUFDN0QsYUFBUyxLQUFLLG9CQUFvQjtBQUFBLE1BQ2hDLGVBQWUsT0FBMkI7QUFBQSxJQUFBO0FBQUEsRUFDNUMsQ0FDRDtBQUM4QjtBQUd6QixRQUFBLGtCQUFvQyxDQUFDLGtCQUFrQjtBQUMzRCxlQUFXLFlBQVksZUFBZTtBQUVoQyxVQUFBLFNBQVMsV0FBVyxRQUFRO0FBQ3JCLGlCQUFBLFdBQVcsUUFBUSxDQUFDLFNBQVM7QUFHbEMsY0FBQSxnQkFBZ0Isb0JBQ2hCLGdCQUFnQixrQkFDaEI7QUFDUSxvQkFBQTtBQUFBLGNBQ04sR0FDRSxnQkFBZ0IsbUJBQW1CLFVBQVUsT0FDL0M7QUFBQSxjQUNBO0FBQUEsWUFBQTtBQUdGLHFCQUFTLEtBQUssb0JBQW9CO0FBQUEsY0FDaEMsZUFBZSxJQUFtQjtBQUFBLFlBQUE7QUFFTDtVQUNqQztBQUFBLFFBQUEsQ0FDRDtBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFBQTtBQUlJLFFBQUEsV0FBVyxJQUFJLGlCQUFpQixlQUFlO0FBR3JELFFBQU0sU0FBUyxFQUFFLFdBQVcsTUFBTSxTQUFTLEtBQUs7QUFHdkMsV0FBQSxRQUFRLFNBQVMsTUFBTSxNQUFNO0FBQ3hDLENBQUM7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTldfQ==
