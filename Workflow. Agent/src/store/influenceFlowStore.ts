import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MessagingWorkflow, AIAgent, MessageLog, AgentResponse } from '../types/influenceFlow';

interface InfluenceFlowState {
  workflows: MessagingWorkflow[];
  agents: AIAgent[];
  messageLogs: MessageLog[];
  agentResponses: AgentResponse[];
  
  // Workflow actions
  createWorkflow: (name: string, description?: string) => MessagingWorkflow;
  updateWorkflow: (id: string, updates: Partial<MessagingWorkflow>) => void;
  deleteWorkflow: (id: string) => void;
  
  // Agent actions
  createAgent: (name: string, description?: string) => AIAgent;
  updateAgent: (id: string, updates: Partial<AIAgent>) => void;
  deleteAgent: (id: string) => void;
  
  // Logging actions
  addMessageLog: (log: Omit<MessageLog, 'id' | 'timestamp'>) => void;
  addAgentResponse: (response: Omit<AgentResponse, 'id' | 'timestamp'>) => void;
  
  // Analytics
  getWorkflowStats: (workflowId: string) => {
    totalMessages: number;
    successRate: number;
    avgResponseTime: number;
  };
}

export const useInfluenceFlowStore = create<InfluenceFlowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      agents: [],
      messageLogs: [],
      agentResponses: [],
      
      createWorkflow: (name: string, description?: string) => {
        const workflow: MessagingWorkflow = {
          id: `workflow_${Date.now()}`,
          name,
          description: description || '',
          steps: [],
          edges: [],
          status: 'draft',
          triggerType: 'manual',
          targetPlatforms: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          workflows: [...state.workflows, workflow]
        }));
        
        return workflow;
      },
      
      updateWorkflow: (id: string, updates: Partial<MessagingWorkflow>) => {
        set((state) => ({
          workflows: state.workflows.map(w => 
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          )
        }));
      },
      
      deleteWorkflow: (id: string) => {
        set((state) => ({
          workflows: state.workflows.filter(w => w.id !== id),
          messageLogs: state.messageLogs.filter(log => log.workflowId !== id),
          agentResponses: state.agentResponses.filter(response => response.workflowId !== id)
        }));
      },
      
      createAgent: (name: string, description?: string) => {
        const agent: AIAgent = {
          id: `agent_${Date.now()}`,
          name,
          description: description || '',
          purpose: '',
          tools: [],
          memory: {
            enabled: false,
            type: 'vector_store',
            contextSize: 4000,
            recallSettings: {}
          },
          chatSettings: {
            systemPrompt: '',
            temperature: 0.7,
            topP: 0.9,
            outputMode: 'message',
            model: 'gpt-4'
          },
          executionLogic: {
            triggers: ['manual'],
            maxRetries: 3
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          agents: [...state.agents, agent]
        }));
        
        return agent;
      },
      
      updateAgent: (id: string, updates: Partial<AIAgent>) => {
        set((state) => ({
          agents: state.agents.map(a => 
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          )
        }));
      },
      
      deleteAgent: (id: string) => {
        set((state) => ({
          agents: state.agents.filter(a => a.id !== id),
          agentResponses: state.agentResponses.filter(response => response.agentId !== id)
        }));
      },
      
      addMessageLog: (log: Omit<MessageLog, 'id' | 'timestamp'>) => {
        const messageLog: MessageLog = {
          ...log,
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({
          messageLogs: [...state.messageLogs, messageLog]
        }));
      },
      
      addAgentResponse: (response: Omit<AgentResponse, 'id' | 'timestamp'>) => {
        const agentResponse: AgentResponse = {
          ...response,
          id: `response_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({
          agentResponses: [...state.agentResponses, agentResponse]
        }));
      },
      
      getWorkflowStats: (workflowId: string) => {
        const state = get();
        const workflowLogs = state.messageLogs.filter(log => log.workflowId === workflowId);
        const workflowResponses = state.agentResponses.filter(response => response.workflowId === workflowId);
        
        const totalMessages = workflowLogs.length;
        const successfulMessages = workflowLogs.filter(log => 
          ['sent', 'delivered', 'read'].includes(log.status)
        ).length;
        const successRate = totalMessages > 0 ? (successfulMessages / totalMessages) * 100 : 0;
        
        const avgResponseTime = workflowResponses.length > 0
          ? workflowResponses.reduce((sum, response) => sum + response.executionTime, 0) / workflowResponses.length
          : 0;
        
        return {
          totalMessages,
          successRate,
          avgResponseTime
        };
      }
    }),
    {
      name: 'influence-flow-storage'
    }
  )
);