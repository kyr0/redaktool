export interface ExtractPromptValues extends Record<string, string> {
  DATA_FORMAT: string;
  CONTENT: string;
  USER_LANGUAGE: string;
}

export const promptTemplateExtraction = `You are an expert data science engineer. Clean up and transform the following CONTENT and return it in data format: {{DATA_FORMAT}}

RULES:
- IMPORTANT RULE: MUST {{CUSTOM_INSTRUCTION}}
- response MUST NOT be wrapped in Markdown code formatting block \`\`\`
- MUST remove links to other articles, categories, tags, or other irrelevant content.
- MUST remove any tracking or analytics code.
- MUST remove any share links or icons.
- MUST remove any advertisements or sponsored content.
- MUST keep keep all relevant content AS IS and only change the data format if necessary.
- MUST respond in {{DATA_FORMAT}} data format.
- Make sure the spelling and grammar are correct.
- MUST clean up and transform CONTENT:
END OF RULES.

CONTENT:
{{CONTENT}}`;
