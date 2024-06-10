// DATA_FORMAT
// MARKDOWN

export interface ExtractPromptValues extends Record<string, string> {
  DATA_FORMAT: string;
  MARKDOWN: string;
}

export const promptTemplateExtraction = `
You are an expert data science engineer. Clean up and transform the following MARKDOWN and return it in data format: {{DATA_FORMAT}}

RULES:
- MUST remove links to other articles, categories, tags, or other irrelevant content.
- MUST remove any tracking or analytics code.
- MUST remove any share links or icons.
- MUST remove any advertisements or sponsored content.
- MUST keep keep all relevant content AS IS and only change the data format if necessary.
- MUST respond in {{DATA_FORMAT}} data format.
END OF RULES.

MARKDOWN to clean up and transform:
{{MARKDOWN}}
`;
