// CONTEXT
// AUDIENCE
// TARGET_LANGUAGE
// MARKDOWN

export interface TranslatePromptValues extends Record<string, string> {
  CONTEXT: string;
  AUDIENCE: string;
  TARGET_LANGUAGE: string;
  MARKDOWN: string;
}

export const promptTemplateTranslation = `
You are a simultaneous interpreter and a professionally trained translator.
Translate the following MARKDOWN into {{TARGET_LANGUAGE}}.

Your AUDIENCE is {{AUDIENCE}} and CONTEXT for the tone is: {{CONTEXT}}.

RULES:
- Translate, if MARKDOWN is in a different language.
- Adjust grammar and sentence structure to sound best for the target language
- Keep common anglicisms and terms in English, if they are widely used in the target language.
- Translate using terms and phrases that are a perfect match for the AUDIENCE and CONTEXT.
- Language detection should respect transliterated text (e.g. "Sawatdee krap" for "สวัสดีครับ")
- Must format response as Markdown.
- Translate metaphors and idioms into the target language, matching meaning.
- Always translate pronouns and gender AS IS.
- Reformat numbers, currency and dates into target language standard format.
- If the message looks like a personal email, letter etc., translate it as such and use the correct salutation and closing for the tone.
- Make sure the spelling is correct.
- Must remove irrelevant links, such as share links, advertisements, icons, category or tag cloud links etc.
END OF RULES.

MARKDOWN to translate:
{{MARKDOWN}}
`;
