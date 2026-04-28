export type AgentIntent = 'faq' | 'scheduling' | 'billing' | 'handoff' | 'sales' | 'unknown';

export interface ClinicContext {
  id: string;
  name: string;
  whatsapp_number: string;
  receptionist_phone: string;
  config_json: any;
  prompt_context: string;
  specialties?: string[];
  operating_hours?: any;
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
