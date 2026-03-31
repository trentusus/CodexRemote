export type ApprovalDecision = "approve" | "decline" | "allow_for_session";

export interface Project {
  id: string;
  cwd: string;
  title: string;
  lastUpdatedAt: number;
}

export interface ChatThread {
  id: string;
  projectId: string;
  title: string;
  preview: string;
  updatedAt: number;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: number;
  phase?: "commentary" | "final_answer";
  workedDurationSeconds?: number;
}

export interface PlanOption {
  label: string;
  description: string;
}

export interface PlanQuestion {
  header: string;
  id: string;
  question: string;
  options: PlanOption[];
}

export interface PlanPrompt {
  callId: string;
  questions: PlanQuestion[];
  createdAt: number;
}

export interface PlanQuestionAnswer {
  answers: string[];
}

export interface PlanPromptResponse {
  answers: Record<string, PlanQuestionAnswer>;
}

export type ChatActivityKind =
  | "thinking"
  | "exploring"
  | "running_command"
  | "file_edited"
  | "context_compacted"
  | "background_terminal"
  | "reconnecting";

export type ChatActivityState = "in_progress" | "completed";

export interface ChatActivity {
  id: string;
  itemId: string;
  kind: ChatActivityKind;
  title: string;
  detail?: string;
  commandPreview?: string;
  createdAt: number;
  updatedAt: number;
  state: ChatActivityState;
  filePath?: string;
  additions?: number;
  deletions?: number;
}

export interface ChatTimeline {
  messages: Message[];
  activities: ChatActivity[];
  planPrompt?: PlanPrompt;
}

export type ApprovalKind = "command" | "fileChange";

export interface ApprovalRequest {
  id: string;
  kind: ApprovalKind;
  summary: string;
  riskLevel: "low" | "medium" | "high";
  createdAt: number;
}

export interface PairingRequestResponse {
  pairingId: string;
  nonce: string;
  expiresAt: number;
  pairingUri: string;
  qrDataUrl: string;
}

export interface PairingConfirmRequest {
  pairingId: string;
  nonce: string;
  deviceName: string;
  devicePublicKey?: string;
}

export interface PairingConfirmResponse {
  deviceId: string;
  token: string;
}

export type StreamEventName =
  | "turn_started"
  | "message_delta"
  | "item_started"
  | "item_completed"
  | "approval_required"
  | "plan_prompt"
  | "turn_completed"
  | "error";

export interface StreamEvent<T = unknown> {
  event: StreamEventName;
  chatId: string;
  payload: T;
  timestamp: number;
}

export function assertNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Expected non-empty string for ${fieldName}`);
  }
  return value;
}
