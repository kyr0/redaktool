import type { PromptApiOptions, PromptResponse } from "./prompt";
import { type GenerateContentRequest, VertexAI } from "@google-cloud/vertexai";

export interface GeminiOptions extends GenerateContentRequest {
  model: string;
}

/**
 * TODO: for a pure non-Node implementation, a GAuth refresh token has to be crafted from the service account file
 * and the endpoint to derive a short lived access token has to be called with the refresh JWT token.

#!/bin/bash

set -euo pipefail

base64var() {
    printf "$1" | base64stream
}

base64stream() {
    base64 | tr '/+' '_-' | tr -d '=\n'
}

key_json_file="$1"
scope="$2"
valid_for_sec="${3:-3600}"
private_key=$(jq -r .private_key $key_json_file)
sa_email=$(jq -r .client_email $key_json_file)

header='{"alg":"RS256","typ":"JWT"}'
claim=$(cat <<EOF | jq -c .
  {
    "iss": "$sa_email",
    "scope": "$scope",
    "aud": "https://www.googleapis.com/oauth2/v4/token",
    "exp": $(($(date +%s) + $valid_for_sec)),
    "iat": $(date +%s)
  }
EOF
)
request_body="$(base64var "$header").$(base64var "$claim")"
signature=$(openssl dgst -sha256 -sign <(echo "$private_key") <(printf "$request_body") | base64stream)

printf "$request_body.$signature"

#!/bin/bash

set -euo pipefail

key_json_file="$1"
scope="$2"

jwt_token=$(./create-jwt-token.sh "$key_json_file" "$scope")

curl -s -X POST https://www.googleapis.com/oauth2/v4/token \
    --data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer' \
    --data-urlencode "assertion=$jwt_token" \
    | jq -r .access_token
 */

// requires a
export const geminiPrompt = async (
  body: GeminiOptions,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  const vertexAI = new VertexAI({
    project: apiOptions.apiKey!,
    location: apiOptions.hostingLocation!,
  });

  const model = body.model || "gemini-1.5-pro-preview-0409";
  // Instantiate the model
  const generativeVisionModel = vertexAI.getGenerativeModel({
    model,
  });
  console.log("Using model:", model);

  const start = Date.now();

  // Create the response stream
  const responseStream =
    await generativeVisionModel.generateContentStream(body);

  // Wait for the response stream to complete
  const aggregatedResponse = await responseStream.response;

  // Select the text from the response
  const fullTextResponse =
    aggregatedResponse.candidates![0].content.parts[0].text;

  const end = Date.now();
  const elapsed = end - start;

  const response = {
    message: fullTextResponse,
    actualUsage: {
      completion_tokens: aggregatedResponse.usageMetadata!.candidatesTokenCount,
      prompt_tokens: aggregatedResponse.usageMetadata!.promptTokenCount,
      total_tokens:
        aggregatedResponse.usageMetadata!.candidatesTokenCount! +
        aggregatedResponse.usageMetadata!.promptTokenCount!,
    },
    finishReason:
      aggregatedResponse.promptFeedback?.blockReasonMessage || "completed",
    elapsed,
  };
  return response;
};
