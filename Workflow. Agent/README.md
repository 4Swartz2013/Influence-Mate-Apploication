# Influence Flow

A modular messaging automation and AI agent workflow system built with React, TypeScript, and Tailwind CSS.

## Overview

Influence Flow is a powerful system for creating and managing:

1. **Messaging Workflows** - Multi-platform messaging sequences with conditional logic
2. **AI Agents** - Configurable AI assistants with tools and memory
3. **Campaign Automation** - Orchestrate messaging across multiple platforms

## Features

### Messaging Workflow Builder
- Create step-by-step messaging sequences
- Support for Instagram DM, Email, WhatsApp, SMS, and Telegram
- Conditional branching based on user responses
- Delay and wait-for-reply steps
- Webhook integration
- AI agent integration

### AI Agent Builder
- Configure AI agents with specific tools
- Memory management for contextual conversations
- Fine-tune model parameters
- Test agents directly in the interface
- Integrate agents into messaging workflows

### Key Components
- Non-drag, node-based workflow system
- Step-by-step configuration panels
- Real-time testing and preview
- Persistent state management

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Lucide React** - Icons
- **Supabase** - Database and authentication (optional)

## Project Structure

```
src/
├── components/
│   ├── influence-flow/
│   │   ├── InfluenceFlowDashboard.tsx   # Main dashboard
│   │   ├── MessagingWorkflowBuilder.tsx # Workflow builder
│   │   ├── MessageStepConfigPanel.tsx   # Step configuration
│   │   ├── StepLibrary.tsx              # Step selection modal
│   │   └── AIAgentBuilder.tsx           # Agent configuration
│   └── ParagonLayout.tsx                # Main layout (integration)
├── store/
│   └── influenceFlowStore.ts            # State management
├── types/
│   └── influenceFlow.ts                 # Type definitions
└── App.tsx                              # Entry point
```

## Getting Started

1. **Installation**:
   ```bash
   npm install
   ```

2. **Development**:
   ```bash
   npm run dev
   ```

3. **Build**:
   ```bash
   npm run build
   ```

## Design Inspiration

This implementation is inspired by:

1. **Paragon's ActionKit** (https://docs.useparagon.com/actionkit/overview) - For the overall UI layout and step configuration approach.

2. **Flowise AgentFlow v2** (https://docs.flowiseai.com/using-flowise/agentflowv2) - For the AI agent architecture and tool configuration.

## License

MIT

## Credits

Developed as part of the Influence Mate platform.