import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCard } from './MessageCard';
import { MessageThread } from './MessageThread';
import { NewMessageModal } from './NewMessageModal';
import { WorkflowWizard } from '../Workflows/WorkflowWizard';
import { BulkReplyModal } from './BulkReplyModal';
import { useMessages } from '../../hooks/useMessages';
import { Message, Platform } from '../../types';
import { MessageSquare, Plus, Filter, Download, Workflow, MoreHorizontal, Trash2, Archive, Flag, RefreshCw } from 'lucide-react';
import { PlatformFilter } from '../shared/PlatformFilter';

interface MessagesViewProps {
  searchQuery: string;
  filters: any;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ searchQuery, filters }) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showWorkflowWizard, setShowWorkflowWizard] = useState(false);
  const [showBulkReplyModal, setShowBulkReplyModal] = useState(false);
  const [workflowTarget, setWorkflowTarget] = useState<{ type: 'message' | 'comment'; id: string } | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [activePlatformFilters, setActivePlatformFilters] = useState<Platform[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    markAsRead, 
    replyToMessage, 
    createMessage, 
    archiveMessages, 
    flagMessages, 
    assignWorkflow,
    bulkReply
  } = useMessages({ 
    ...filters, 
    search: searchQuery,
    platforms: activePlatformFilters.length > 0 ? activePlatformFilters : undefined
  });

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const handleNewMessage = (messageData: any) => {
    createMessage(messageData);
    setShowNewMessage(false);
  };

  const handleWorkflowAssign = (messageId: string) => {
    setWorkflowTarget({ type: 'message', id: messageId });
    setShowWorkflowWizard(true);
  };

  const handleWorkflowComplete = (workflowId: string, config: any) => {
    if (workflowTarget) {
      if (workflowTarget.type === 'message') {
        assignWorkflow({ 
          messageIds: [workflowTarget.id], 
          workflowId 
        });
      }
    } else if (selectedMessages.length > 0) {
      assignWorkflow({ 
        messageIds: selectedMessages, 
        workflowId 
      });
    }
    
    setShowWorkflowWizard(false);
    setWorkflowTarget(null);
  };

  const handleBulkReply = () => {
    setShowBulkReplyModal(true);
  };

  const handleSendBulkReply = (content: string) => {
    bulkReply({ 
      messageIds: selectedMessages, 
      replyContent: content 
    });
    setShowBulkReplyModal(false);
  };

  const handleBulkWorkflow = () => {
    setShowWorkflowWizard(true);
  };

  const handleBulkArchive = () => {
    archiveMessages(selectedMessages);
    setSelectedMessages([]);
    setShowBulkActions(false);
  };

  const handleBulkFlag = () => {
    flagMessages(selectedMessages);
    setShowBulkActions(false);
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(m => m.id));
    }
  };

  const handlePlatformFilterChange = (platforms: Platform[]) => {
    setActivePlatformFilters(platforms);
  };

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-96 border-r border-gray-200 bg-white">
          <div className="animate-pulse p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-gray-50"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full">
        {/* Message List */}
        <div className={`${selectedMessage ? 'hidden lg:block' : 'flex-1'} lg:w-96 border-r border-gray-200 bg-white overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{messages.length} Messages</h3>
                {selectedMessages.length > 0 && (
                  <span className="text-sm text-gray-600">({selectedMessages.length} selected)</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNewMessage(true)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  {selectedMessages.length === messages.length ? 'Deselect All' : 'Select All'}
                </button>
                
                {selectedMessages.length > 0 && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Bulk Actions
                    </button>
                    
                    {showBulkActions && (
                      <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button 
                          onClick={handleBulkReply}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Reply All</span>
                        </button>
                        <button 
                          onClick={handleBulkWorkflow}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Workflow className="w-4 h-4" />
                          <span>Assign Workflow</span>
                        </button>
                        <button 
                          onClick={handleBulkArchive}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Archive</span>
                        </button>
                        <button 
                          onClick={handleBulkFlag}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Flag className="w-4 h-4" />
                          <span>Flag</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded hover:bg-gray-100">
                  <Filter className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Platform Filter */}
          <div className="px-4 py-2 border-b border-gray-200">
            <PlatformFilter 
              activePlatforms={activePlatformFilters}
              onChange={handlePlatformFilterChange}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => setShowNewMessage(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send First Message
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((message, index) => (
                  <div key={message.id} className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message.id)}
                        onChange={() => toggleMessageSelection(message.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="pl-8">
                      <MessageCard
                        message={message}
                        onClick={() => handleMessageClick(message)}
                        onWorkflowAssign={() => handleWorkflowAssign(message.id)}
                        isSelected={selectedMessage?.id === message.id}
                        delay={index * 0.05}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`${selectedMessage ? 'flex-1' : 'hidden'} lg:flex lg:flex-1 flex-col`}>
          {selectedMessage ? (
            <MessageThread
              message={selectedMessage}
              onClose={() => setSelectedMessage(null)}
              onReply={(content) => replyToMessage({ messageId: selectedMessage.id, replyContent: content })}
              onWorkflowAssign={() => handleWorkflowAssign(selectedMessage.id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a message
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a message from the list to view and reply to conversations.
                </p>
                <button
                  onClick={() => setShowNewMessage(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onSend={handleNewMessage}
        />
      )}

      {/* Workflow Wizard */}
      {showWorkflowWizard && (
        <WorkflowWizard
          onClose={() => setShowWorkflowWizard(false)}
          onAssign={handleWorkflowComplete}
          targetType={workflowTarget?.type || 'message'}
          targetId={workflowTarget?.id || selectedMessages[0] || ''}
        />
      )}

      {/* Bulk Reply Modal */}
      {showBulkReplyModal && (
        <BulkReplyModal
          onClose={() => setShowBulkReplyModal(false)}
          onSend={handleSendBulkReply}
          count={selectedMessages.length}
        />
      )}
    </>
  );
};