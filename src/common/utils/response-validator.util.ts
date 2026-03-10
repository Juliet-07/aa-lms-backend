import * as crypto from 'crypto';
import {
  getReflectionKeywordConfig,
  getScenarioKeywordConfig,
  QuestionKeywordConfig,
} from './keywords.registry';

export const normalize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

export const isGibberish = (text: string): boolean => {
  if (!text || text.trim().length < 20) return true;
  const words = text.trim().split(/\s+/);
  if (words.length < 8) return true;
  if (/(.)\1{4,}/.test(text)) return true;
  const shortWords = words.filter((w) => w.length <= 2);
  if (shortWords.length / words.length > 0.6) return true;
  const vowelCount = (text.match(/[aeiou]/gi) || []).length;
  const letterCount = (text.match(/[a-z]/gi) || []).length;
  if (letterCount > 0 && vowelCount / letterCount < 0.15) return true;
  return false;
};

export const hashResponse = (text: string): string => {
  const normalized = normalize(text).join(' ');
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

export const hasDuplicateResponses = (
  responses: Array<{ response: string }>,
): boolean => {
  const hashes = responses.map((r) => hashResponse(r.response));
  return new Set(hashes).size < hashes.length;
};

export const validateAgainstConfig = (
  response: string,
  config: QuestionKeywordConfig,
): { valid: boolean; reason?: string } => {
  const responseText = response.toLowerCase();

  const requiredMatches = config.required.filter((kw) =>
    responseText.includes(kw),
  );
  const contextualMatches = config.contextual.filter((kw) =>
    responseText.includes(kw),
  );

  if (requiredMatches.length < config.minRequired) {
    return {
      valid: false,
      reason:
        'Your response does not appear to address the key concepts of this question. Please re-read the question and reflect on the specific topic it is asking about.',
    };
  }

  if (contextualMatches.length < config.minContextual) {
    return {
      valid: false,
      reason:
        'Your response lacks enough depth or context related to this question. Try to engage more specifically with the themes of the activity.',
    };
  }

  return { valid: true };
};

export const validateReflectionResponse = (
  moduleId: number,
  segmentId: number,
  promptId: number,
  response: string,
): { valid: boolean; reason?: string } => {
  if (isGibberish(response)) {
    return {
      valid: false,
      reason:
        'Your response appears to be too short or low quality. Please provide a thoughtful answer of at least a few sentences.',
    };
  }

  const config = getReflectionKeywordConfig(moduleId, segmentId, promptId);
  return validateAgainstConfig(response, config);
};

export const validateScenarioResponse = (
  moduleId: number,
  segmentId: number,
  response: string,
): { valid: boolean; reason?: string } => {
  if (isGibberish(response)) {
    return {
      valid: false,
      reason:
        'Your response appears to be too short or low quality. Please provide a thoughtful answer of at least a few sentences.',
    };
  }

  const config = getScenarioKeywordConfig(moduleId, segmentId);
  return validateAgainstConfig(response, config);
};

export const validateReflectionSubmission = (
  moduleId: number,
  segmentId: number,
  responses: Array<{ promptId: number; question: string; response: string }>,
): { valid: boolean; reason?: string } => {
  if (responses.length > 1 && hasDuplicateResponses(responses)) {
    return {
      valid: false,
      reason:
        'The same response was submitted for multiple questions. Each question requires a unique, individual answer.',
    };
  }

  for (const item of responses) {
    const result = validateReflectionResponse(
      moduleId,
      segmentId,
      item.promptId,
      item.response,
    );
    if (!result.valid) {
      return {
        valid: false,
        reason: `Question ${item.promptId}: ${result.reason}`,
      };
    }
  }

  return { valid: true };
};

export const validateScenarioSubmission = (
  moduleId: number,
  segmentId: number,
  response: string,
): { valid: boolean; reason?: string } => {
  return validateScenarioResponse(moduleId, segmentId, response);
};
