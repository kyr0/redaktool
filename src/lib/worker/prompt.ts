import {
  Hash,
  Tag,
  type TagToken,
  Context,
  type TopLevelToken,
  Liquid,
} from "liquidjs";
import JSON5 from "json5";
import type { HTMLInputTypeAttribute } from "react";

export type ParseResult = {
  key: string;
  default: string;
  options: Array<string>;
  label: string;
  order: number;
  type?: HTMLInputTypeAttribute;
};

export type ParseSmartPromptResult = {
  promptTemplate: string;
  meta: Record<string, ParseResult>;
  inputValues: Record<string, string>;
  templateValues: Record<string, string>;
  outputValues: Record<string, string>;
  prompt: string;
  error?: unknown;
};

const defaultMeta = (meta: Record<string, ParseResult>, key: string) => {
  if (!meta[key]) {
    meta[key] = {
      key,
      default: "",
      options: [],
      label: key,
      order: 0,
      type: "text",
    };
  }
};

export const autoDetectType = (value: ParseResult): HTMLInputTypeAttribute => {
  if (
    value.options &&
    Array.isArray(value.options) &&
    value.options.length > 0
  ) {
    return "select";
  }

  if (value.default && typeof value.default === "number") {
    return "number";
  }

  if (value.default && value.default.indexOf("\n") !== -1) {
    return "textarea";
  }
  return "text";
};

/** smart prompt compiler (preprocessor for meta data followed by handlebars compilation pass) */
export const compileSmartPrompt = (
  promptTemplate: string,
  inputValues: Record<string, string> = {},
): ParseSmartPromptResult => {
  let prompt = "";
  let error;
  const meta: Record<string, ParseResult> = {};
  const templateValues: Record<string, string> = {};
  const ctx = new Context();

  try {
    const engine = new Liquid();

    // meta data for fields
    /** 
     
     {% field FIELD_NAME: "{ 
        default: 'bar', 
        label: 'foo', 
        options: ['bar', 'baz'] 
      }" %}

     {% field FIELD_NAME_2 = "{ options: ['bar', 'baz'] }" %} 

     */

    let fieldIndex = 0;
    engine.registerTag(
      "field",
      class DefaultTag extends Tag {
        private hash: Hash;
        constructor(
          tagToken: TagToken,
          remainTokens: TopLevelToken[],
          liquid: Liquid,
        ) {
          super(tagToken, remainTokens, liquid);

          const hashNonJekyllStyle = new Hash(tagToken.args);
          const hashJekyllStyle = new Hash(tagToken.args, true);

          const hashNonJekyllStyleHasUndefineds = Object.values(
            hashNonJekyllStyle.hash,
          ).some((v) => v === undefined);
          const hashJekyllStyleHasUndefineds = Object.values(
            hashJekyllStyle.hash,
          ).some((v) => v === undefined);

          // both syntaxes are supported
          this.hash = hashNonJekyllStyleHasUndefineds
            ? hashJekyllStyle
            : hashJekyllStyleHasUndefineds
              ? hashNonJekyllStyle
              : new Hash("");
        }
        *render(ctx: Context) {
          const hash: { [key: string]: string | boolean | number } =
            yield this.hash.render(ctx);

          const keys = Object.keys(hash);

          for (const key of keys) {
            // lazy JSON5 parsing
            const value = JSON5.parse(
              // https://spec.json5.org/#summary-of-features => Strings may span multiple lines by escaping new line characters.
              String(hash[key]).replace(/\n/g, "\\n"),
            ) as ParseResult;
            value.key = key;

            // evaluate default value
            templateValues[key] = inputValues[key] ?? value.default;

            defaultMeta(meta, key);

            // meta data merge
            meta[key].default = value.default;

            meta[key].label = value.label ?? key;

            meta[key].type = value.type ?? autoDetectType(value);

            meta[key].order = fieldIndex;

            if (value.options && Array.isArray(value.options)) {
              if (meta[key].default) {
                meta[key].default = String(value.options[0]);
              }

              meta[key].options = value.options.map((v) => String(v));
            }
            fieldIndex++;
          }
          return ""; // no rendering
        }
      },
    );

    ctx.globals = {
      ...templateValues,
      ...inputValues,
    };

    prompt = engine.parseAndRenderSync(promptTemplate, ctx).trim();
  } catch (e) {
    error = (e as Error).message;
  }

  return {
    templateValues,
    promptTemplate,
    meta,
    inputValues,
    outputValues: ctx.getAll() as Record<string, string>,
    prompt,
    error,
  };
};
