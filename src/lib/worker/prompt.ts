import Handlebars from "handlebars";

export type ParseResult = {
  key: string;
  defaultValue: string;
  options: Array<string>;
};

export type ParseSmartPromptResult = {
  handlebarsTemplateText: string;
  meta: Record<string, ParseResult>;
  inputValues: Record<string, string>;
  templateValues: Record<string, string>;
  prompt: string;
  error?: unknown;
};

/** smart prompt compiler (preprocessor for meta data followed by handlebars compilation pass) */
export const compileSmartPrompt = (
  promptTemplate: string,
  inputValues: Record<string, string>,
): ParseSmartPromptResult => {
  let prompt = "";
  let handlebarsTemplateText = "";
  let error;
  const meta: Record<string, ParseResult> = {};
  const templateValues: Record<string, string> = {};

  try {
    handlebarsTemplateText = promptTemplate.replace(
      // support {{ KEY }}, {{ KEY || "default Value" }} and {{ KEY || "defaultValue" || ["option1", "option2"] }} syntaxes
      // parses it, and replaces it with the resolved value only
      /{{\s*([A-Z0-9_]+)\s*(?:\|\|\s*"([^"]*)")?(?:\|\|\s*(\[.*?\]))?\s*}}/g,
      (_, key, defaultValue = "", options = "[]") => {
        const sanitizedKey = key.trim().toUpperCase();
        const resolvedValue = inputValues[sanitizedKey] ?? defaultValue;

        // store the resolved value (default or input value)
        templateValues[sanitizedKey] = resolvedValue;

        meta[sanitizedKey] = {
          key: sanitizedKey,
          defaultValue,
          options: JSON.parse(options),
        };
        return `{{${sanitizedKey}}}`;
      },
    );

    // pass 2: handlebars compile / AST transform
    const template = Handlebars.compile(handlebarsTemplateText);
    prompt = template(templateValues); // apply handlebars with analyzed values
  } catch (e) {
    error = e;
  }

  return {
    templateValues,
    handlebarsTemplateText,
    meta,
    inputValues,
    prompt,
    error,
  };
};
