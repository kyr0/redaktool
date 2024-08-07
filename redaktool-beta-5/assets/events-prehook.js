// node_modules/css-selector-generator/esm/utilities-iselement.js
function isElement(input) {
  return typeof input === "object" && input !== null && input.nodeType === Node.ELEMENT_NODE;
}

// node_modules/css-selector-generator/esm/types.js
var OPERATOR = {
  NONE: "",
  DESCENDANT: " ",
  CHILD: " > "
};
var CSS_SELECTOR_TYPE = {
  id: "id",
  class: "class",
  tag: "tag",
  attribute: "attribute",
  nthchild: "nthchild",
  nthoftype: "nthoftype"
};

// node_modules/css-selector-generator/esm/utilities-typescript.js
function isEnumValue(haystack, needle) {
  return Object.values(haystack).includes(needle);
}

// node_modules/css-selector-generator/esm/utilities-messages.js
function showWarning(id = "unknown problem", ...args) {
  console.warn(`${libraryName}: ${id}`, ...args);
}
var libraryName = "CssSelectorGenerator";

// node_modules/css-selector-generator/esm/utilities-options.js
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
var DEFAULT_OPTIONS = {
  selectors: [
    CSS_SELECTOR_TYPE.id,
    CSS_SELECTOR_TYPE.class,
    CSS_SELECTOR_TYPE.tag,
    CSS_SELECTOR_TYPE.attribute
  ],
  includeTag: false,
  whitelist: [],
  blacklist: [],
  combineWithinSelector: true,
  combineBetweenSelectors: true,
  root: null,
  maxCombinations: Number.POSITIVE_INFINITY,
  maxCandidates: Number.POSITIVE_INFINITY
};

// node_modules/css-selector-generator/esm/utilities-data.js
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

// node_modules/css-selector-generator/esm/utilities-dom.js
function testSelector(elements, selector, root) {
  const result = Array.from(sanitizeRoot(root, elements[0]).querySelectorAll(selector));
  return result.length === elements.length && elements.every((element) => result.includes(element));
}
function getElementParents(element, root) {
  root = root !== null && root !== undefined ? root : getRootNode(element);
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

// node_modules/css-selector-generator/esm/constants.js
var SELECTOR_SEPARATOR = ", ";
var INVALID_ID_RE = new RegExp([
  "^$",
  "\\s"
].join("|"));
var INVALID_CLASS_RE = new RegExp([
  "^$"
].join("|"));
var SELECTOR_PATTERN = [
  CSS_SELECTOR_TYPE.nthoftype,
  CSS_SELECTOR_TYPE.tag,
  CSS_SELECTOR_TYPE.id,
  CSS_SELECTOR_TYPE.class,
  CSS_SELECTOR_TYPE.attribute,
  CSS_SELECTOR_TYPE.nthchild
];

// node_modules/css-selector-generator/esm/selector-attribute.js
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
var sanitizeAttributeData = function({ nodeName, nodeValue }) {
  return {
    name: sanitizeSelectorItem(nodeName),
    value: sanitizeSelectorItem(nodeValue)
  };
};
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
var attributeBlacklistMatch = createPatternMatcher([
  "class",
  "id",
  "ng-*"
]);

// node_modules/css-selector-generator/esm/selector-class.js
function getElementClassSelectors(element) {
  return (element.getAttribute("class") || "").trim().split(/\s+/).filter((item) => !INVALID_CLASS_RE.test(item)).map((item) => `.${sanitizeSelectorItem(item)}`);
}
function getClassSelectors(elements) {
  const elementSelectors = elements.map(getElementClassSelectors);
  return getIntersection(elementSelectors);
}

// node_modules/css-selector-generator/esm/selector-id.js
function getElementIdSelectors(element) {
  const id = element.getAttribute("id") || "";
  const selector = `#${sanitizeSelectorItem(id)}`;
  const rootNode = element.getRootNode({ composed: false });
  return !INVALID_ID_RE.test(id) && testSelector([element], selector, rootNode) ? [selector] : [];
}
function getIdSelector(elements) {
  return elements.length === 0 || elements.length > 1 ? [] : getElementIdSelectors(elements[0]);
}

// node_modules/css-selector-generator/esm/selector-nth-child.js
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

// node_modules/css-selector-generator/esm/selector-tag.js
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

// node_modules/css-selector-generator/esm/selector-nth-of-type.js
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

// node_modules/css-selector-generator/esm/utilities-powerset.js
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
var bumpOffsets = function(offsets = [], maxValue = 0) {
  const size = offsets.length;
  if (size === 0) {
    return [];
  }
  const result = [...offsets];
  result[size - 1] += 1;
  for (let index = size - 1;index >= 0; index--) {
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
};
var generateOffsets = function(size = 1) {
  return Array.from(Array(size).keys());
};

// node_modules/css-selector-generator/esm/utilities-cartesian.js
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

// node_modules/css-selector-generator/esm/utilities-selectors.js
function sanitizeSelectorItem(input = "") {
  var _a, _b;
  return (_b = (_a = CSS === null || CSS === undefined ? undefined : CSS.escape) === null || _a === undefined ? undefined : _a.call(CSS, input)) !== null && _b !== undefined ? _b : legacySanitizeSelectorItem(input);
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
function getElementSelectorsByType(element, selectorType) {
  return ELEMENT_SELECTOR_TYPE_GETTERS[selectorType](element);
}
function getSelectorsByType(elements, selector_type) {
  var _a;
  const getter = (_a = SELECTOR_TYPE_GETTERS[selector_type]) !== null && _a !== undefined ? _a : () => [];
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
var addTagTypeIfNeeded = function(list) {
  return list.includes(CSS_SELECTOR_TYPE.tag) || list.includes(CSS_SELECTOR_TYPE.nthoftype) ? [...list] : [...list, CSS_SELECTOR_TYPE.tag];
};
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
var generateCandidateCombinations = function(selectors, rootSelector) {
  return [
    ...selectors.map((selector) => rootSelector + OPERATOR.DESCENDANT + selector),
    ...selectors.map((selector) => rootSelector + OPERATOR.CHILD + selector)
  ];
};
var generateCandidates = function(selectors, rootSelector) {
  return rootSelector === "" ? selectors : generateCandidateCombinations(selectors, rootSelector);
};
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
var ESCAPED_COLON = ":".charCodeAt(0).toString(16).toUpperCase();
var SPECIAL_CHARACTERS_RE = /[ !"#$%&'()\[\]{|}<>*+,./;=?@^`~\\]/;
var SELECTOR_TYPE_GETTERS = {
  tag: getTagSelector,
  id: getIdSelector,
  class: getClassSelectors,
  attribute: getAttributeSelectors,
  nthchild: getNthChildSelector,
  nthoftype: getNthOfTypeSelector
};
var ELEMENT_SELECTOR_TYPE_GETTERS = {
  tag: getElementTagSelectors,
  id: getElementIdSelectors,
  class: getElementClassSelectors,
  attribute: getElementAttributeSelectors,
  nthchild: getElementNthChildSelector,
  nthoftype: getElementNthOfTypeSelector
};

// node_modules/css-selector-generator/esm/utilities-element-data.js
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

// node_modules/css-selector-generator/esm/selector-fallback.js
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

// node_modules/css-selector-generator/esm/index.js
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

// node_modules/runtime-info/dist/index.mjs
var o = () => typeof window > "u" || typeof window.document > "u";

// node_modules/simply-persist-sync/dist/index.esm.js
var a = () => {
  let r = new Map;
  return { clear: () => {
    r.clear();
  }, getItem: (e) => r.get(String(e)) ?? null, removeItem: (e) => {
    r.delete(String(e));
  }, setItem: (e, i) => {
    r.set(String(e), i);
  } };
};
var p = a();
var t = class {
  storage;
  constructor(e) {
    this.storage = e || p;
  }
  get(e, i, o2) {
    let n = this.storage.getItem(e);
    if (!n)
      return i;
    let s = JSON.parse(n);
    return typeof o2 == "function" && (s = o2(e, s)), s;
  }
  set(e, i, o2) {
    typeof o2 == "function" && (i = o2(e, i)), this.storage.setItem(e, JSON.stringify(i));
  }
  del(e) {
    this.storage.removeItem(e);
  }
  clear() {
    this.storage.clear();
  }
  get backendApi() {
    return this.storage;
  }
};
var c = (r, e) => {
  switch (r) {
    case "session":
      return new t(window.sessionStorage);
    case "local":
      return new t(window.localStorage);
    case "memory":
      return new t;
  }
};
var P = (r, e) => {
  switch (r) {
    case "session":
      return new t;
    case "local":
      return new t;
    case "memory":
      return new t;
  }
};
var I = (r = "local", e) => o() ? P(r, e) : c(r, e);

// src/lib/content-script/utils.ts
var getNamespacedKey = (key) => `__languagemagic_${key}`;

// src/lib/content-script/prefs.ts
var prefPerPage = (key, defaultValue) => {
  const storage = I("local");
  return {
    get: () => storage.get(getNamespacedKey(key), defaultValue),
    set: (value) => storage.set(getNamespacedKey(key), value)
  };
};

// src/events-prehook.ts
var init = () => {
  if (document.body && !document.body.$$_ftrEventListenersMap) {
    document.body.$$_ftrEventListenersMap = new Map;
  }
  if (document.body && !document.body.$$_ftrMediaElements) {
    document.body.$$_ftrMediaElements = [];
  }
};
var broadcastMediaElementSelectors = () => {
  prefPerPage("mediaElements", []).set(document.body.$$_ftrMediaElements);
};
document.addEventListener("DOMContentLoaded", () => {
  init();
  document.querySelectorAll("audio, video").forEach((element) => {
    document.body.$$_ftrMediaElements.push(getCssSelector(element));
  });
  broadcastMediaElementSelectors();
  const handleMutations = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLAudioElement || node instanceof HTMLVideoElement) {
            console.log(`${node instanceof HTMLAudioElement ? "audio" : "video"} appended`, node);
            document.body.$$_ftrMediaElements.push(getCssSelector(node));
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
