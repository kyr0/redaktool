export interface SummaryPromptValues extends Record<string, string> {
  TONE: string;
  AUDIENCE: string;
  FORMATTING: "bullet points" | "paragraphs";
  TOPIC_COUNT: string /** e.g. five */ | "all";
  TYPE: "chronological" | "thematic" | "chronological-thematic";
  EXAMPLE: string;
  CONTENT: string;
  CUSTOM_INSTRUCTION: string;
  MAX_SENTENCES_PER_TOPIC: string;
}

export const promptTemplateSummary = `You are an expert data analyst, journalist and writer with many years of professional experience.
Summarize the following CONTENT into maximum {{TOPIC_COUNT}} most relevant topics, formatted as {{FORMATTING}} in Markdown.

RULES:
- The summary MUST be formulated in a way, so that the following audience can understand it: "{{AUDIENCE}}". Explain, if the audience might not understand the topics.
- The summary MUST be written in a the following tone: "{{TONE}}"
- The summary MUST be structured in a "{{TYPE}}" order.
- MUST order by time markers, if the TYPE is chronological or chronological-thematic.
- MUST respond in the language of CONTENT.
- DO NOT use prior knowledge.
- ALWAYS ONLY, EXCLUSIVELY work by the information provided in the CONTENT data, and nothing else (evidence-based).
- Every topic in the summary MUST be grounded by evidence in the CONTENT data.
- Each topic MUST not exceed {{MAX_SENTENCES_PER_TOPIC}} sentences.
- MUST use the scientific method and deduction for reasoning.
- MUST format response as Markdown.
- MUST adapt metaphors, common sayings and idioms, matching meaning.
- Always translate pronouns and gender AS IS.
- Make sure the spelling is correct.
- Response MUST NOT be wrapped in Markdown code formatting block \`\`\`.
- The response MUST match the EXAMPLE provided in structure.
END OF RULES.

MOST IMPORTANT RULE: 
- MUST {{CUSTOM_INSTRUCTION}}
END OF MOST IMPORTANT RULE.

EXAMPLE:
{{EXAMPLE}}
END OF EXAMPLE.

Summarize the following CONTENT into max. {{TOPIC_COUNT}} topics:
{{CONTENT}}`;
