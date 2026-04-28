export type AgentIntent = 'faq' | 'scheduling' | 'billing' | 'handoff' | 'unknown';

export interface ClinicContext {
    id: string;
    name: string;
    slug: string;
    operating_hours: any;
    address: string;
    tone_of_voice: string;
    specialties: string[];
    receptionist_phone: string;
    google_calendar_id?: string;
}

export interface PatientContext {
    id: string;
    name?: string;
    phone: string;
    email?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AgentResponse {
    content: string;
    intent?: AgentIntent;
    needs_action?: boolean;
    action_data?: any;
}

export interface IAgent {
    name: string;
    process(message: string, context: { clinic: ClinicContext, patient: PatientContext, history: ChatMessage[] }): Promise<AgentResponse>;
}
