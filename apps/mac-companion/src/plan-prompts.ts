import type { PlanOption, PlanPrompt, PlanPromptResponse, PlanQuestion } from "@codex-remote/protocol";

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parsePlanOptions(value: unknown): PlanOption[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const options: PlanOption[] = [];

  for (const entry of value) {
    const typed = asRecord(entry);
    const label = asNonEmptyString(typed?.label);
    const description = asNonEmptyString(typed?.description);
    if (!label || !description) {
      return undefined;
    }

    options.push({ label, description });
  }

  return options.length > 0 ? options : undefined;
}

function parsePlanQuestions(value: unknown): PlanQuestion[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const questions: PlanQuestion[] = [];

  for (const entry of value) {
    const typed = asRecord(entry);
    const header = asNonEmptyString(typed?.header);
    const id = asNonEmptyString(typed?.id);
    const question = asNonEmptyString(typed?.question);
    const options = parsePlanOptions(typed?.options);

    if (!header || !id || !question || !options) {
      return undefined;
    }

    questions.push({
      header,
      id,
      question,
      options,
    });
  }

  return questions.length > 0 ? questions : undefined;
}

function parsePromptArguments(input: unknown): { questions: PlanQuestion[] } | undefined {
  if (typeof input === "string") {
    try {
      return parsePromptArguments(JSON.parse(input));
    } catch {
      return undefined;
    }
  }

  const typed = asRecord(input);
  const questions = parsePlanQuestions(typed?.questions);
  if (!questions) {
    return undefined;
  }

  return { questions };
}

export function parsePlanPrompt(
  callId: string,
  input: unknown,
  createdAt: number,
): PlanPrompt | undefined {
  const parsed = parsePromptArguments(input);
  if (!parsed) {
    return undefined;
  }

  return {
    callId,
    questions: parsed.questions,
    createdAt,
  };
}

export function extractPlanPromptCallId(value: unknown): string | undefined {
  const typed = asRecord(value);
  return asNonEmptyString(typed?.callId)
    ?? asNonEmptyString(typed?.call_id)
    ?? asNonEmptyString(typed?.toolCallId);
}

function normalizeAnswerList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const answers = value
    .map(asNonEmptyString)
    .filter((entry): entry is string => Boolean(entry));

  return answers.length > 0 ? answers : undefined;
}

export function parsePlanPromptResponse(value: unknown): PlanPromptResponse | undefined {
  if (typeof value === "string") {
    try {
      return parsePlanPromptResponse(JSON.parse(value));
    } catch {
      return undefined;
    }
  }

  const typed = asRecord(value);
  const answersRecord = asRecord(typed?.answers);
  if (!answersRecord) {
    return undefined;
  }

  const answers: PlanPromptResponse["answers"] = {};

  for (const [questionId, rawEntry] of Object.entries(answersRecord)) {
    const entry = asRecord(rawEntry);
    const normalizedAnswers = normalizeAnswerList(entry?.answers);
    if (!normalizedAnswers) {
      return undefined;
    }

    answers[questionId] = { answers: normalizedAnswers };
  }

  return Object.keys(answers).length > 0 ? { answers } : undefined;
}

export function buildPlanPromptResponseOutput(value: PlanPromptResponse): string {
  return JSON.stringify(value);
}
