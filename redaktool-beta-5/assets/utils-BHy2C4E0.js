function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
const CLASS_PART_SEPARATOR = "-";
function createClassGroupUtils(config) {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  function getClassGroupId(className) {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    if (classParts[0] === "" && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  }
  function getConflictingClassGroupIds(classGroupId, hasPostfixModifier) {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  }
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
}
function getGroupRecursive(classParts, classPartObject) {
  var _a;
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : void 0;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return void 0;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return (_a = classPartObject.validators.find(({
    validator
  }) => validator(classRest))) == null ? void 0 : _a.classGroupId;
}
const arbitraryPropertyRegex = /^\[(.+)\]$/;
function getGroupIdForArbitraryProperty(className) {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName == null ? void 0 : arbitraryPropertyClassName.substring(0, arbitraryPropertyClassName.indexOf(":"));
    if (property) {
      return "arbitrary.." + property;
    }
  }
}
function createClassMap(config) {
  const {
    theme,
    prefix
  } = config;
  const classMap = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  const prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
  prefixedClassGroupEntries.forEach(([classGroupId, classGroup]) => {
    processClassesRecursively(classGroup, classMap, classGroupId, theme);
  });
  return classMap;
}
function processClassesRecursively(classGroup, classPartObject, classGroupId, theme) {
  classGroup.forEach((classDefinition) => {
    if (typeof classDefinition === "string") {
      const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === "function") {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup2]) => {
      processClassesRecursively(classGroup2, getPart(classPartObject, key), classGroupId, theme);
    });
  });
}
function getPart(classPartObject, path) {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach((pathPart) => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: /* @__PURE__ */ new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
}
function isThemeGetter(func) {
  return func.isThemeGetter;
}
function getPrefixedClassGroupEntries(classGroupEntries, prefix) {
  if (!prefix) {
    return classGroupEntries;
  }
  return classGroupEntries.map(([classGroupId, classGroup]) => {
    const prefixedClassGroup = classGroup.map((classDefinition) => {
      if (typeof classDefinition === "string") {
        return prefix + classDefinition;
      }
      if (typeof classDefinition === "object") {
        return Object.fromEntries(Object.entries(classDefinition).map(([key, value]) => [prefix + key, value]));
      }
      return classDefinition;
    });
    return [classGroupId, prefixedClassGroup];
  });
}
function createLruCache(maxCacheSize) {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ new Map();
  let previousCache = /* @__PURE__ */ new Map();
  function update(key, value) {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ new Map();
    }
  }
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache.get(key)) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
}
const IMPORTANT_MODIFIER = "!";
function createParseClassName(config) {
  const {
    separator,
    experimentalParseClassName
  } = config;
  const isSeparatorSingleCharacter = separator.length === 1;
  const firstSeparatorCharacter = separator[0];
  const separatorLength = separator.length;
  function parseClassName(className) {
    const modifiers = [];
    let bracketDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0) {
        if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + separatorLength;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") {
        bracketDepth++;
      } else if (currentCharacter === "]") {
        bracketDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
    const baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  }
  if (experimentalParseClassName) {
    return function parseClassNameExperimental(className) {
      return experimentalParseClassName({
        className,
        parseClassName
      });
    };
  }
  return parseClassName;
}
function sortModifiers(modifiers) {
  if (modifiers.length <= 1) {
    return modifiers;
  }
  const sortedModifiers = [];
  let unsortedModifiers = [];
  modifiers.forEach((modifier) => {
    const isArbitraryVariant = modifier[0] === "[";
    if (isArbitraryVariant) {
      sortedModifiers.push(...unsortedModifiers.sort(), modifier);
      unsortedModifiers = [];
    } else {
      unsortedModifiers.push(modifier);
    }
  });
  sortedModifiers.push(...unsortedModifiers.sort());
  return sortedModifiers;
}
function createConfigUtils(config) {
  return {
    cache: createLruCache(config.cacheSize),
    parseClassName: createParseClassName(config),
    ...createClassGroupUtils(config)
  };
}
const SPLIT_CLASSES_REGEX = /\s+/;
function mergeClassList(classList, configUtils) {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds
  } = configUtils;
  const classGroupsInConflict = /* @__PURE__ */ new Set();
  return classList.trim().split(SPLIT_CLASSES_REGEX).map((originalClassName) => {
    const {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    let hasPostfixModifier = Boolean(maybePostfixModifierPosition);
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        return {
          isTailwindClass: false,
          originalClassName
        };
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        return {
          isTailwindClass: false,
          originalClassName
        };
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    return {
      isTailwindClass: true,
      modifierId,
      classGroupId,
      originalClassName,
      hasPostfixModifier
    };
  }).reverse().filter((parsed) => {
    if (!parsed.isTailwindClass) {
      return true;
    }
    const {
      modifierId,
      classGroupId,
      hasPostfixModifier
    } = parsed;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.has(classId)) {
      return false;
    }
    classGroupsInConflict.add(classId);
    getConflictingClassGroupIds(classGroupId, hasPostfixModifier).forEach((group) => classGroupsInConflict.add(modifierId + group));
    return true;
  }).reverse().map((parsed) => parsed.originalClassName).join(" ");
}
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
}
function toValue(mix) {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
}
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
function fromTheme(key) {
  const themeGetter = (theme) => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
}
const arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
const fractionRegex = /^\d+\/\d+$/;
const stringLengths = /* @__PURE__ */ new Set(["px", "full", "screen"]);
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
function isLength(value) {
  return isNumber(value) || stringLengths.has(value) || fractionRegex.test(value);
}
function isArbitraryLength(value) {
  return getIsArbitraryValue(value, "length", isLengthOnly);
}
function isNumber(value) {
  return Boolean(value) && !Number.isNaN(Number(value));
}
function isArbitraryNumber(value) {
  return getIsArbitraryValue(value, "number", isNumber);
}
function isInteger(value) {
  return Boolean(value) && Number.isInteger(Number(value));
}
function isPercent(value) {
  return value.endsWith("%") && isNumber(value.slice(0, -1));
}
function isArbitraryValue(value) {
  return arbitraryValueRegex.test(value);
}
function isTshirtSize(value) {
  return tshirtUnitRegex.test(value);
}
const sizeLabels = /* @__PURE__ */ new Set(["length", "size", "percentage"]);
function isArbitrarySize(value) {
  return getIsArbitraryValue(value, sizeLabels, isNever);
}
function isArbitraryPosition(value) {
  return getIsArbitraryValue(value, "position", isNever);
}
const imageLabels = /* @__PURE__ */ new Set(["image", "url"]);
function isArbitraryImage(value) {
  return getIsArbitraryValue(value, imageLabels, isImage);
}
function isArbitraryShadow(value) {
  return getIsArbitraryValue(value, "", isShadow);
}
function isAny() {
  return true;
}
function getIsArbitraryValue(value, label, testValue) {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return typeof label === "string" ? result[1] === label : label.has(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
}
function isLengthOnly(value) {
  return lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
}
function isNever() {
  return false;
}
function isShadow(value) {
  return shadowRegex.test(value);
}
function isImage(value) {
  return imageRegex.test(value);
}
function getDefaultConfig() {
  const colors = fromTheme("colors");
  const spacing = fromTheme("spacing");
  const blur = fromTheme("blur");
  const brightness = fromTheme("brightness");
  const borderColor = fromTheme("borderColor");
  const borderRadius = fromTheme("borderRadius");
  const borderSpacing = fromTheme("borderSpacing");
  const borderWidth = fromTheme("borderWidth");
  const contrast = fromTheme("contrast");
  const grayscale = fromTheme("grayscale");
  const hueRotate = fromTheme("hueRotate");
  const invert = fromTheme("invert");
  const gap = fromTheme("gap");
  const gradientColorStops = fromTheme("gradientColorStops");
  const gradientColorStopPositions = fromTheme("gradientColorStopPositions");
  const inset = fromTheme("inset");
  const margin = fromTheme("margin");
  const opacity = fromTheme("opacity");
  const padding = fromTheme("padding");
  const saturate = fromTheme("saturate");
  const scale = fromTheme("scale");
  const sepia = fromTheme("sepia");
  const skew = fromTheme("skew");
  const space = fromTheme("space");
  const translate = fromTheme("translate");
  const getOverscroll = () => ["auto", "contain", "none"];
  const getOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const getSpacingWithAutoAndArbitrary = () => ["auto", isArbitraryValue, spacing];
  const getSpacingWithArbitrary = () => [isArbitraryValue, spacing];
  const getLengthWithEmptyAndArbitrary = () => ["", isLength, isArbitraryLength];
  const getNumberWithAutoAndArbitrary = () => ["auto", isNumber, isArbitraryValue];
  const getPositions = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"];
  const getLineStyles = () => ["solid", "dashed", "dotted", "double", "none"];
  const getBlendModes = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const getAlign = () => ["start", "end", "center", "between", "around", "evenly", "stretch"];
  const getZeroAndEmpty = () => ["", "0", isArbitraryValue];
  const getBreaks = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const getNumber = () => [isNumber, isArbitraryNumber];
  const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [isAny],
      spacing: [isLength, isArbitraryLength],
      blur: ["none", "", isTshirtSize, isArbitraryValue],
      brightness: getNumber(),
      borderColor: [colors],
      borderRadius: ["none", "", "full", isTshirtSize, isArbitraryValue],
      borderSpacing: getSpacingWithArbitrary(),
      borderWidth: getLengthWithEmptyAndArbitrary(),
      contrast: getNumber(),
      grayscale: getZeroAndEmpty(),
      hueRotate: getNumberAndArbitrary(),
      invert: getZeroAndEmpty(),
      gap: getSpacingWithArbitrary(),
      gradientColorStops: [colors],
      gradientColorStopPositions: [isPercent, isArbitraryLength],
      inset: getSpacingWithAutoAndArbitrary(),
      margin: getSpacingWithAutoAndArbitrary(),
      opacity: getNumber(),
      padding: getSpacingWithArbitrary(),
      saturate: getNumber(),
      scale: getNumber(),
      sepia: getZeroAndEmpty(),
      skew: getNumberAndArbitrary(),
      space: getSpacingWithArbitrary(),
      translate: getSpacingWithArbitrary()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", isArbitraryValue]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isTshirtSize]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": getBreaks()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": getBreaks()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: [...getPositions(), isArbitraryValue]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: getOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": getOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": getOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: getOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": getOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": getOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [inset]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [inset]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [inset]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [inset]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [inset]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [inset]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [inset]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [inset]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [inset]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ["auto", isInteger, isArbitraryValue]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: getSpacingWithAutoAndArbitrary()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["wrap", "wrap-reverse", "nowrap"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ["1", "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: getZeroAndEmpty()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: getZeroAndEmpty()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", isInteger, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [isAny]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [isAny]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": ["auto", "min", "max", "fr", isArbitraryValue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", isArbitraryValue]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [gap]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [gap]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [gap]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: ["normal", ...getAlign()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": ["start", "end", "center", "stretch"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", "start", "end", "center", "stretch"]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...getAlign(), "baseline"]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", "start", "end", "center", "stretch", "baseline"]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": [...getAlign(), "baseline"]
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", "start", "end", "center", "stretch"]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [padding]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [padding]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [padding]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [padding]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [padding]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [padding]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [padding]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [padding]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [padding]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [margin]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [margin]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [margin]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [margin]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [margin]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [margin]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [margin]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [margin]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [margin]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [space]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      "space-y": [{
        "space-y": [space]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-y-reverse": ["space-y-reverse"],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", isArbitraryValue, spacing]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [isArbitraryValue, spacing, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [isArbitraryValue, spacing, "none", "full", "min", "max", "fit", "prose", {
          screen: [isTshirtSize]
        }, isTshirtSize]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [isArbitraryValue, spacing, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [isArbitraryValue, spacing, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [isArbitraryValue, spacing, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [isArbitraryValue, spacing, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", isTshirtSize, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", isArbitraryNumber]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isAny]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractons"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", isNumber, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", isLength, isArbitraryValue]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryValue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: [colors]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      "placeholder-opacity": [{
        "placeholder-opacity": [opacity]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: [colors]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      "text-opacity": [{
        "text-opacity": [opacity]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...getLineStyles(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", isLength, isArbitraryLength]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", isLength, isArbitraryValue]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: [colors]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: getSpacingWithArbitrary()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryValue]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      "bg-opacity": [{
        "bg-opacity": [opacity]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: [...getPositions(), isArbitraryPosition]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: ["no-repeat", {
          repeat: ["", "x", "y", "round", "space"]
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ["auto", "cover", "contain", isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: [colors]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [gradientColorStops]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [borderRadius]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [borderRadius]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [borderRadius]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [borderRadius]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [borderRadius]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [borderRadius]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [borderRadius]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [borderRadius]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [borderRadius]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [borderRadius]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [borderRadius]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [borderRadius]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [borderRadius]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [borderRadius]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [borderRadius]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [borderWidth]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [borderWidth]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [borderWidth]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [borderWidth]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [borderWidth]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [borderWidth]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [borderWidth]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [borderWidth]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [borderWidth]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [opacity]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...getLineStyles(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [borderWidth]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y": [{
        "divide-y": [borderWidth]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      "divide-opacity": [{
        "divide-opacity": [opacity]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: getLineStyles()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [borderColor]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [borderColor]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [borderColor]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [borderColor]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [borderColor]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [borderColor]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [borderColor]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [borderColor]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...getLineStyles()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isLength, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [isLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: [colors]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w": [{
        ring: getLengthWithEmptyAndArbitrary()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      "ring-color": [{
        ring: [colors]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      "ring-opacity": [{
        "ring-opacity": [opacity]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [isLength, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      "ring-offset-color": [{
        "ring-offset": [colors]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ["", "inner", "none", isTshirtSize, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [isAny]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [opacity]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...getBlendModes(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": getBlendModes()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ["", "none"]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [blur]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [brightness]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [contrast]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": ["", "none", isTshirtSize, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [grayscale]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [hueRotate]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [invert]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [saturate]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [sepia]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": ["", "none"]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": [blur]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [brightness]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [contrast]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": [grayscale]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [hueRotate]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [invert]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [opacity]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [saturate]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [sepia]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": [borderSpacing]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [borderSpacing]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [borderSpacing]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", isArbitraryValue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: getNumberAndArbitrary()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: getNumberAndArbitrary()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", isArbitraryValue]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ["", "gpu", "none"]
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [scale]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [scale]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [scale]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [isInteger, isArbitraryValue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [translate]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [translate]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [skew]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [skew]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", isArbitraryValue]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ["auto", colors]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryValue]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: [colors]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["none", "auto"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "y", "x", ""]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryValue]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [colors, "none"]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [colors, "none"]
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    }
  };
}
const twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
const cn = (...inputs) => twMerge(clsx(inputs));
const getNamespacedKey = (key) => `__languagemagic_${key}`;
const safeDisplayPosition = (position) => {
  let { x, y } = position;
  if (x > window.innerWidth) {
    x = window.innerWidth - 100;
  }
  if (y > window.innerHeight) {
    y = window.innerHeight - 100;
  }
  if (y < 0) {
    y = 0;
  }
  if (x < 0) {
    x = 0;
  }
  return { x, y };
};
export {
  clsx as a,
  cn as c,
  getNamespacedKey as g,
  safeDisplayPosition as s
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMtQkh5MkM0RTAuanMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9jbHN4L2Rpc3QvY2xzeC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmQtbWVyZ2Uvc3JjL2xpYi9jbGFzcy1ncm91cC11dGlscy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy90YWlsd2luZC1tZXJnZS9zcmMvbGliL2xydS1jYWNoZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy90YWlsd2luZC1tZXJnZS9zcmMvbGliL3BhcnNlLWNsYXNzLW5hbWUudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmQtbWVyZ2Uvc3JjL2xpYi9jb25maWctdXRpbHMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmQtbWVyZ2Uvc3JjL2xpYi9tZXJnZS1jbGFzc2xpc3QudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmQtbWVyZ2Uvc3JjL2xpYi90dy1qb2luLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3RhaWx3aW5kLW1lcmdlL3NyYy9saWIvY3JlYXRlLXRhaWx3aW5kLW1lcmdlLnRzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3RhaWx3aW5kLW1lcmdlL3NyYy9saWIvZnJvbS10aGVtZS50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy90YWlsd2luZC1tZXJnZS9zcmMvbGliL3ZhbGlkYXRvcnMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdGFpbHdpbmQtbWVyZ2Uvc3JjL2xpYi9kZWZhdWx0LWNvbmZpZy50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy90YWlsd2luZC1tZXJnZS9zcmMvbGliL3R3LW1lcmdlLnRzIiwiLi4vLi4vc3JjL2xpYi9jb250ZW50LXNjcmlwdC91dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiByKGUpe3ZhciB0LGYsbj1cIlwiO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlfHxcIm51bWJlclwiPT10eXBlb2YgZSluKz1lO2Vsc2UgaWYoXCJvYmplY3RcIj09dHlwZW9mIGUpaWYoQXJyYXkuaXNBcnJheShlKSl7dmFyIG89ZS5sZW5ndGg7Zm9yKHQ9MDt0PG87dCsrKWVbdF0mJihmPXIoZVt0XSkpJiYobiYmKG4rPVwiIFwiKSxuKz1mKX1lbHNlIGZvcihmIGluIGUpZVtmXSYmKG4mJihuKz1cIiBcIiksbis9Zik7cmV0dXJuIG59ZXhwb3J0IGZ1bmN0aW9uIGNsc3goKXtmb3IodmFyIGUsdCxmPTAsbj1cIlwiLG89YXJndW1lbnRzLmxlbmd0aDtmPG87ZisrKShlPWFyZ3VtZW50c1tmXSkmJih0PXIoZSkpJiYobiYmKG4rPVwiIFwiKSxuKz10KTtyZXR1cm4gbn1leHBvcnQgZGVmYXVsdCBjbHN4OyIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLCJpbXBvcnQgeyB0eXBlIENsYXNzVmFsdWUsIGNsc3ggfSBmcm9tIFwiY2xzeFwiO1xuaW1wb3J0IHsgdHdNZXJnZSB9IGZyb20gXCJ0YWlsd2luZC1tZXJnZVwiO1xuXG5leHBvcnQgY29uc3QgY24gPSAoLi4uaW5wdXRzOiBDbGFzc1ZhbHVlW10pID0+IHR3TWVyZ2UoY2xzeChpbnB1dHMpKTtcblxuZXhwb3J0IGNvbnN0IHB4VG9QY3QgPSAocHg6IG51bWJlciwgYmFzZTogbnVtYmVyKSA9PiAocHggLyBiYXNlKSAqIDEwMDtcblxuZXhwb3J0IGNvbnN0IHBjdFRvUHggPSAocGN0OiBudW1iZXIsIGJhc2U6IG51bWJlcikgPT4gKHBjdCAvIDEwMCkgKiBiYXNlO1xuXG5leHBvcnQgY29uc3QgZ2V0TmFtZXNwYWNlZEtleSA9IChrZXk6IHN0cmluZykgPT4gYF9fbGFuZ3VhZ2VtYWdpY18ke2tleX1gO1xuXG5leHBvcnQgY29uc3Qgc2FmZURpc3BsYXlQb3NpdGlvbiA9IChwb3NpdGlvbjogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9KSA9PiB7XG4gIGxldCB7IHgsIHkgfSA9IHBvc2l0aW9uO1xuICBpZiAoeCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgeCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMTAwO1xuICB9XG5cbiAgaWYgKHkgPiB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcbiAgICB5ID0gd2luZG93LmlubmVySGVpZ2h0IC0gMTAwO1xuICB9XG5cbiAgaWYgKHkgPCAwKSB7XG4gICAgeSA9IDA7XG4gIH1cblxuICBpZiAoeCA8IDApIHtcbiAgICB4ID0gMDtcbiAgfVxuICByZXR1cm4geyB4LCB5IH07XG59O1xuIl0sIm5hbWVzIjpbIkNMQVNTX1BBUlRfU0VQQVJBVE9SIiwiY3JlYXRlQ2xhc3NHcm91cFV0aWxzIiwiY29uZmlnIiwiY2xhc3NNYXAiLCJjcmVhdGVDbGFzc01hcCIsImNvbmZsaWN0aW5nQ2xhc3NHcm91cHMiLCJjb25mbGljdGluZ0NsYXNzR3JvdXBNb2RpZmllcnMiLCJnZXRDbGFzc0dyb3VwSWQiLCJjbGFzc05hbWUiLCJjbGFzc1BhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJzaGlmdCIsImdldEdyb3VwUmVjdXJzaXZlIiwiZ2V0R3JvdXBJZEZvckFyYml0cmFyeVByb3BlcnR5IiwiZ2V0Q29uZmxpY3RpbmdDbGFzc0dyb3VwSWRzIiwiY2xhc3NHcm91cElkIiwiaGFzUG9zdGZpeE1vZGlmaWVyIiwiY29uZmxpY3RzIiwiY2xhc3NQYXJ0T2JqZWN0IiwiY3VycmVudENsYXNzUGFydCIsIm5leHRDbGFzc1BhcnRPYmplY3QiLCJuZXh0UGFydCIsImdldCIsImNsYXNzR3JvdXBGcm9tTmV4dENsYXNzUGFydCIsInNsaWNlIiwidW5kZWZpbmVkIiwidmFsaWRhdG9ycyIsImNsYXNzUmVzdCIsImpvaW4iLCJmaW5kIiwidmFsaWRhdG9yIiwiYXJiaXRyYXJ5UHJvcGVydHlSZWdleCIsInRlc3QiLCJhcmJpdHJhcnlQcm9wZXJ0eUNsYXNzTmFtZSIsImV4ZWMiLCJwcm9wZXJ0eSIsInN1YnN0cmluZyIsImluZGV4T2YiLCJ0aGVtZSIsInByZWZpeCIsIk1hcCIsInByZWZpeGVkQ2xhc3NHcm91cEVudHJpZXMiLCJnZXRQcmVmaXhlZENsYXNzR3JvdXBFbnRyaWVzIiwiT2JqZWN0IiwiZW50cmllcyIsImNsYXNzR3JvdXBzIiwiZm9yRWFjaCIsImNsYXNzR3JvdXAiLCJwcm9jZXNzQ2xhc3Nlc1JlY3Vyc2l2ZWx5IiwiY2xhc3NEZWZpbml0aW9uIiwiY2xhc3NQYXJ0T2JqZWN0VG9FZGl0IiwiZ2V0UGFydCIsImlzVGhlbWVHZXR0ZXIiLCJwdXNoIiwia2V5IiwicGF0aCIsImN1cnJlbnRDbGFzc1BhcnRPYmplY3QiLCJwYXRoUGFydCIsImhhcyIsInNldCIsImZ1bmMiLCJjbGFzc0dyb3VwRW50cmllcyIsIm1hcCIsInByZWZpeGVkQ2xhc3NHcm91cCIsImZyb21FbnRyaWVzIiwidmFsdWUiLCJjcmVhdGVMcnVDYWNoZSIsIm1heENhY2hlU2l6ZSIsImNhY2hlU2l6ZSIsImNhY2hlIiwicHJldmlvdXNDYWNoZSIsInVwZGF0ZSIsIklNUE9SVEFOVF9NT0RJRklFUiIsImNyZWF0ZVBhcnNlQ2xhc3NOYW1lIiwic2VwYXJhdG9yIiwiZXhwZXJpbWVudGFsUGFyc2VDbGFzc05hbWUiLCJpc1NlcGFyYXRvclNpbmdsZUNoYXJhY3RlciIsImZpcnN0U2VwYXJhdG9yQ2hhcmFjdGVyIiwic2VwYXJhdG9yTGVuZ3RoIiwicGFyc2VDbGFzc05hbWUiLCJtb2RpZmllcnMiLCJicmFja2V0RGVwdGgiLCJtb2RpZmllclN0YXJ0IiwicG9zdGZpeE1vZGlmaWVyUG9zaXRpb24iLCJpbmRleCIsImN1cnJlbnRDaGFyYWN0ZXIiLCJiYXNlQ2xhc3NOYW1lV2l0aEltcG9ydGFudE1vZGlmaWVyIiwiaGFzSW1wb3J0YW50TW9kaWZpZXIiLCJzdGFydHNXaXRoIiwiYmFzZUNsYXNzTmFtZSIsIm1heWJlUG9zdGZpeE1vZGlmaWVyUG9zaXRpb24iLCJwYXJzZUNsYXNzTmFtZUV4cGVyaW1lbnRhbCIsInNvcnRNb2RpZmllcnMiLCJzb3J0ZWRNb2RpZmllcnMiLCJ1bnNvcnRlZE1vZGlmaWVycyIsIm1vZGlmaWVyIiwiaXNBcmJpdHJhcnlWYXJpYW50Iiwic29ydCIsImNyZWF0ZUNvbmZpZ1V0aWxzIiwiU1BMSVRfQ0xBU1NFU19SRUdFWCIsIm1lcmdlQ2xhc3NMaXN0IiwiY2xhc3NMaXN0IiwiY29uZmlnVXRpbHMiLCJjbGFzc0dyb3Vwc0luQ29uZmxpY3QiLCJTZXQiLCJ0cmltIiwib3JpZ2luYWxDbGFzc05hbWUiLCJCb29sZWFuIiwiaXNUYWlsd2luZENsYXNzIiwidmFyaWFudE1vZGlmaWVyIiwibW9kaWZpZXJJZCIsInJldmVyc2UiLCJmaWx0ZXIiLCJwYXJzZWQiLCJjbGFzc0lkIiwiYWRkIiwiZ3JvdXAiLCJ0d0pvaW4iLCJhcmd1bWVudCIsInJlc29sdmVkVmFsdWUiLCJzdHJpbmciLCJhcmd1bWVudHMiLCJ0b1ZhbHVlIiwibWl4IiwiayIsImNyZWF0ZVRhaWx3aW5kTWVyZ2UiLCJjcmVhdGVDb25maWdGaXJzdCIsImNyZWF0ZUNvbmZpZ1Jlc3QiLCJjYWNoZUdldCIsImNhY2hlU2V0IiwiZnVuY3Rpb25Ub0NhbGwiLCJpbml0VGFpbHdpbmRNZXJnZSIsInJlZHVjZSIsInByZXZpb3VzQ29uZmlnIiwiY3JlYXRlQ29uZmlnQ3VycmVudCIsInRhaWx3aW5kTWVyZ2UiLCJjYWNoZWRSZXN1bHQiLCJyZXN1bHQiLCJjYWxsVGFpbHdpbmRNZXJnZSIsImFwcGx5IiwiZnJvbVRoZW1lIiwidGhlbWVHZXR0ZXIiLCJhcmJpdHJhcnlWYWx1ZVJlZ2V4IiwiZnJhY3Rpb25SZWdleCIsInN0cmluZ0xlbmd0aHMiLCJ0c2hpcnRVbml0UmVnZXgiLCJsZW5ndGhVbml0UmVnZXgiLCJjb2xvckZ1bmN0aW9uUmVnZXgiLCJzaGFkb3dSZWdleCIsImltYWdlUmVnZXgiLCJpc0xlbmd0aCIsImlzTnVtYmVyIiwiaXNBcmJpdHJhcnlMZW5ndGgiLCJnZXRJc0FyYml0cmFyeVZhbHVlIiwiaXNMZW5ndGhPbmx5IiwiTnVtYmVyIiwiaXNOYU4iLCJpc0FyYml0cmFyeU51bWJlciIsImlzSW50ZWdlciIsImlzUGVyY2VudCIsImVuZHNXaXRoIiwiaXNBcmJpdHJhcnlWYWx1ZSIsImlzVHNoaXJ0U2l6ZSIsInNpemVMYWJlbHMiLCJpc0FyYml0cmFyeVNpemUiLCJpc05ldmVyIiwiaXNBcmJpdHJhcnlQb3NpdGlvbiIsImltYWdlTGFiZWxzIiwiaXNBcmJpdHJhcnlJbWFnZSIsImlzSW1hZ2UiLCJpc0FyYml0cmFyeVNoYWRvdyIsImlzU2hhZG93IiwiaXNBbnkiLCJsYWJlbCIsInRlc3RWYWx1ZSIsImdldERlZmF1bHRDb25maWciLCJjb2xvcnMiLCJzcGFjaW5nIiwiYmx1ciIsImJyaWdodG5lc3MiLCJib3JkZXJDb2xvciIsImJvcmRlclJhZGl1cyIsImJvcmRlclNwYWNpbmciLCJib3JkZXJXaWR0aCIsImNvbnRyYXN0IiwiZ3JheXNjYWxlIiwiaHVlUm90YXRlIiwiaW52ZXJ0IiwiZ2FwIiwiZ3JhZGllbnRDb2xvclN0b3BzIiwiZ3JhZGllbnRDb2xvclN0b3BQb3NpdGlvbnMiLCJpbnNldCIsIm1hcmdpbiIsIm9wYWNpdHkiLCJwYWRkaW5nIiwic2F0dXJhdGUiLCJzY2FsZSIsInNlcGlhIiwic2tldyIsInNwYWNlIiwidHJhbnNsYXRlIiwiZ2V0T3ZlcnNjcm9sbCIsImdldE92ZXJmbG93IiwiZ2V0U3BhY2luZ1dpdGhBdXRvQW5kQXJiaXRyYXJ5IiwiZ2V0U3BhY2luZ1dpdGhBcmJpdHJhcnkiLCJnZXRMZW5ndGhXaXRoRW1wdHlBbmRBcmJpdHJhcnkiLCJnZXROdW1iZXJXaXRoQXV0b0FuZEFyYml0cmFyeSIsImdldFBvc2l0aW9ucyIsImdldExpbmVTdHlsZXMiLCJnZXRCbGVuZE1vZGVzIiwiZ2V0QWxpZ24iLCJnZXRaZXJvQW5kRW1wdHkiLCJnZXRCcmVha3MiLCJnZXROdW1iZXIiLCJnZXROdW1iZXJBbmRBcmJpdHJhcnkiLCJhc3BlY3QiLCJjb250YWluZXIiLCJjb2x1bW5zIiwiYm94IiwiZGlzcGxheSIsImZsb2F0IiwiY2xlYXIiLCJpc29sYXRpb24iLCJvYmplY3QiLCJvdmVyZmxvdyIsIm92ZXJzY3JvbGwiLCJwb3NpdGlvbiIsInN0YXJ0IiwiZW5kIiwidG9wIiwicmlnaHQiLCJib3R0b20iLCJsZWZ0IiwidmlzaWJpbGl0eSIsInoiLCJiYXNpcyIsImZsZXgiLCJncm93Iiwic2hyaW5rIiwib3JkZXIiLCJjb2wiLCJzcGFuIiwicm93IiwianVzdGlmeSIsImNvbnRlbnQiLCJpdGVtcyIsInNlbGYiLCJwIiwicHgiLCJweSIsInBzIiwicGUiLCJwdCIsInByIiwicGIiLCJwbCIsIm0iLCJteCIsIm15IiwibXMiLCJtZSIsIm10IiwibXIiLCJtYiIsIm1sIiwidyIsInNjcmVlbiIsImgiLCJzaXplIiwidGV4dCIsImZvbnQiLCJ0cmFja2luZyIsImxlYWRpbmciLCJsaXN0IiwicGxhY2Vob2xkZXIiLCJkZWNvcmF0aW9uIiwiaW5kZW50IiwiYWxpZ24iLCJ3aGl0ZXNwYWNlIiwiYnJlYWsiLCJoeXBoZW5zIiwiYmciLCJyZXBlYXQiLCJmcm9tIiwidmlhIiwidG8iLCJyb3VuZGVkIiwiYm9yZGVyIiwiZGl2aWRlIiwib3V0bGluZSIsInJpbmciLCJzaGFkb3ciLCJ0YWJsZSIsImNhcHRpb24iLCJ0cmFuc2l0aW9uIiwiZHVyYXRpb24iLCJlYXNlIiwiZGVsYXkiLCJhbmltYXRlIiwidHJhbnNmb3JtIiwicm90YXRlIiwib3JpZ2luIiwiYWNjZW50IiwiYXBwZWFyYW5jZSIsImN1cnNvciIsImNhcmV0IiwicmVzaXplIiwic2Nyb2xsIiwic25hcCIsInRvdWNoIiwic2VsZWN0IiwiZmlsbCIsInN0cm9rZSIsInNyIiwidHdNZXJnZSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxFQUFFLEdBQUU7QUFBQyxNQUFJLEdBQUUsR0FBRSxJQUFFO0FBQUcsTUFBRyxZQUFVLE9BQU8sS0FBRyxZQUFVLE9BQU8sRUFBRSxNQUFHO0FBQUEsV0FBVSxZQUFVLE9BQU8sRUFBRSxLQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUU7QUFBQyxRQUFJLElBQUUsRUFBRTtBQUFPLFNBQUksSUFBRSxHQUFFLElBQUUsR0FBRSxJQUFJLEdBQUUs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LGNBQWMsQ0FBQztBQUFBLFFBQUUsY0FBYyxDQUFDQSxZQUFZO0FBQUEsTUFBQyxDQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUsvQyxjQUFjLENBQUM7QUFBQSxRQUFFLGNBQWMsQ0FBQ0EsWUFBWTtBQUFBLE1BQUMsQ0FBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLL0MsY0FBYyxDQUFDO0FBQUEsUUFBRSxjQUFjLENBQUNBLFlBQVk7QUFBQSxNQUFDLENBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSy9DLGNBQWMsQ0FBQztBQUFBLFFBQUUsY0FBYyxDQUFDQSxZQUFZO0FBQUEsTUFBQyxDQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUsvQyxjQUFjLENBQUM7QUFBQSxRQUFFLGNBQWMsQ0FBQ0EsWUFBWTtBQUFBLE1BQUMsQ0FBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLL0MsY0FBYyxDQUFDO0FBQUEsUUFBRSxjQUFjLENBQUNBLFlBQVk7QUFBQSxNQUFDLENBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSy9DLGNBQWMsQ0FBQztBQUFBLFFBQUUsY0FBYyxDQUFDQSxZQUFZO0FBQUEsTUFBQyxDQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUsvQyxZQUFZLENBQUM7QUFBQSxRQUFFMEcsUUFBUSxDQUFDeEcsV0FBVztBQUFBLE1BQUMsQ0FBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFLdEMsY0FBYyxDQUFDO0FBQUEsUUFBRSxZQUFZLENBQUNBLFdBQVc7QUFBQSxNQUFDLENBQUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSzVDLGNBQWMsQ0FBQztBQUFBLFFBQUUsWUFBWSxDQUFDQSxXQUFXO0FBQUEsTUFBQyxDQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUs1QyxjQUFjLENBQUM7QUFBQSxRQUFFLFlBQVksQ0FBQ0EsV0FBVztBQUFBLE1BQUMsQ0FBRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEs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
