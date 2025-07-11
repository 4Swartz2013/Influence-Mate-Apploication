export interface MessageStep {
  id: string;
  type: 'send_message' | 'delay' | 'wait_for_reply' | 'branch_condition' | 'webhook_trigger' | 'run_agent';
  position: { x: number; y: number };
  data: {
    label: string;
    subtitle?: string;
    platform?: 'instagram' | 'email' | 'whatsapp' | 'sms' | 'telegram';
    config: MessageStepConfig;
    status?: 'idle' | 'running' | 'success' | 'error' | 'waiting';
  };
}

export interface MessageStepConfig {
  // Send Message Config
  messageTemplate?: string;
  variables?: Record<string, string>;
  personalization?: boolean;
  
  // Delay Config
  delayAmount?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  
  // Wait for Reply Config
  timeoutDuration?: number;
  timeoutAction?: 'continue' | 'end' | 'tag';
  
  // Branch Condition Config
  condition?: string;
  conditionType?: 'reply_received' | 'time_elapsed' | 'custom_field' | 'agent_decision';
  
  // Webhook Config
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST';
  webhookHeaders?: Record<string, string>;
  
  // Agent Config
  agentId?: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  fallbackResponse?: string;
}

export interface MessagingWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: MessageStep[];
  edges: MessageEdge[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'manual' | 'campaign' | 'response' | 'webhook';
  targetPlatforms: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  purpose: string;
  tools: AgentTool[];
  memory: AgentMemory;
  chatSettings: AgentChatSettings;
  executionLogic: AgentExecutionLogic;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTool {
  id: string;
  name: string;
  type: 'web_scraper' | 'search_tool' | 'api_call' | 'data_extractor' | 'code_interpreter';
  config: Record<string, any>;
  enabled: boolean;
}

export interface AgentMemory {
  enabled: boolean;
  type: 'vector_store' | 'supabase' | 'redis';
  contextSize: number;
  recallSettings: Record<string, any>;
}

export interface AgentChatSettings {
  systemPrompt: string;
  temperature: number;
  topP: number;
  outputMode: 'message' | 'api_payload' | 'internal_variable';
  model: string;
}

export interface AgentExecutionLogic {
  triggers: string[];
  fallbackResponse?: string;
  rerunSettings?: Record<string, any>;
  maxRetries: number;
}

export interface MessageLog {
  id: string;
  workflowId: string;
  stepId: string;
  platform: string;
  recipientId: string;
  messageContent: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  timestamp: string;
  metadata: Record<string, any>;
}

export interface AgentResponse {
  id: string;
  agentId: string;
  workflowId: string;
  stepId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  executionTime: number;
  status: 'success' | 'error' | 'timeout';
  timestamp: string;
}