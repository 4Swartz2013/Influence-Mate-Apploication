// Simple types for workflow system
export interface BaseNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface BaseEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}