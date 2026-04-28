export type AgentIntent = 'faq' | 'scheduling' | 'billing' | 'handoff' | 'unknown';

export interface ClinicContext {
  id: string;
  name: string;
  whatsapp_number: string;
  receptionist_phone: string;
  config_json: any;
  prompt_context: string;
}

export interface PatientContext {
  id: string;
  phone: string;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentResponse {
  content: string;
  intent?: AgentIntent;
  needs_action?: boolean;
}
