import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  Database,
  Zap,
  Check,
  AlertCircle,
  FileText,
  Globe,
  Mail,
  Users,
  Sparkles,
  Bot,
  Search,
  TrendingUp
} from 'lucide-react';

interface CRMConnectionWizardProps {
  onClose: () => void;
  onComplete: (source: string, config: any) => void;
}

const integrationSources = [
  {
    id: 'csv-upload',
    name: 'CSV Upload',
    description: 'Upload a CSV file with your contacts',
    icon: Upload,
    type: 'file',
    color: 'bg-blue-500'
  },
  {
    id: 'google-contacts',
    name: 'Google Contacts',
    description: 'Import from Google Contacts',
    icon: Users,
    type: 'integration',
    color: 'bg-red-500'
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Import from Microsoft Outlook',
    icon: Mail,
    type: 'integration',
    color: 'bg-blue-600'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect to Salesforce CRM',
    icon: Database,
    type: 'integration',
    color: 'bg-blue-400'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Import from HubSpot CRM',
    icon: Database,
    type: 'integration',
    color: 'bg-orange-500'
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Connect to Pipedrive CRM',
    icon: Database,
    type: 'integration',
    color: 'bg-green-500'
  }
];

const enrichmentAgents = [
  {
    id: 'social-scraper',
    name: 'Social Media Scraper',
    description: 'Scrape public social media profiles for follower counts, engagement rates, and bio information',
    icon: Globe,
    features: ['Follower counts', 'Engagement rates', 'Bio information', 'Profile pictures'],
    accuracy: 85,
    cost: 0.05
  },
  {
    id: 'ai-analyzer',
    name: 'AI Content Analyzer',
    description: 'Analyze post history and comments to understand interests, sentiment, and engagement patterns',
    icon: Bot,
    features: ['Interest analysis', 'Sentiment scoring', 'Engagement patterns', 'Content themes'],
    accuracy: 92,
    cost: 0.15
  },
  {
    id: 'professional-enricher',
    name: 'Professional Data Enricher',
    description: 'Find professional information including company, job title, and business contact details',
    icon: TrendingUp,
    features: ['Company information', 'Job titles', 'Business emails', 'LinkedIn profiles'],
    accuracy: 88,
    cost: 0.25
  },
  {
    id: 'relationship-mapper',
    name: 'Relationship Mapper',
    description: 'Map connections and relationships between contacts to identify influence networks',
    icon: Users,
    features: ['Connection mapping', 'Influence scoring', 'Network analysis', 'Mutual connections'],
    accuracy: 78,
    cost: 0.20
  }
];

const steps = [
  { id: 1, title: 'Select Source', description: 'Choose your contact source' },
  { id: 2, title: 'Configure Import', description: 'Set up import settings' },
  { id: 3, title: 'Enrichment Setup', description: 'Configure AI enrichment' },
  { id: 4, title: 'Review & Import', description: 'Review and start import' }
];

export const CRMConnectionWizard: React.FC<CRMConnectionWizardProps> = ({ 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importConfig, setImportConfig] = useState({
    skipDuplicates: true,
    enrichOnImport: true,
    autoTag: true
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadedFile(file);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const calculateTotalCost = () => {
    return selectedAgents.reduce((total, agentId) => {
      const agent = enrichmentAgents.find(a => a.id === agentId);
      return total + (agent?.cost || 0);
    }, 0);
  };

  const handleStartImport = () => {
    onComplete(selectedSource!, {
      file: uploadedFile,
      agents: selectedAgents,
      config: importConfig
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Contact Source
              </h3>
              <p className="text-gray-600">
                Choose where you'd like to import your contacts from
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrationSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;

                return (
                  <motion.div
                    key={source.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSource(source.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{source.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                      </div>
                      
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configure Import Settings
              </h3>
              <p className="text-gray-600">
                Set up how you want to import your contacts
              </p>
            </div>

            {selectedSource === 'csv-upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h4>
                  <p className="text-gray-600 mb-4">
                    Upload a CSV file with your contact information
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                  {uploadedFile && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">{uploadedFile.name}</span>
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedSource !== 'csv-upload' && (
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Integration Setup</h4>
                </div>
                <p className="text-blue-800 mb-4">
                  You'll be redirected to authenticate with {integrationSources.find(s => s.id === selectedSource)?.name}
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Connect to {integrationSources.find(s => s.id === selectedSource)?.name}
                </button>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Import Options</h4>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importConfig.skipDuplicates}
                  onChange={(e) => setImportConfig(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Skip duplicate contacts</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importConfig.enrichOnImport}
                  onChange={(e) => setImportConfig(prev => ({ ...prev, enrichOnImport: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Enrich contacts during import</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importConfig.autoTag}
                  onChange={(e) => setImportConfig(prev => ({ ...prev, autoTag: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Auto-tag contacts by source</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Advanced Enrichment Setup
              </h3>
              <p className="text-gray-600">
                Select AI agents to enrich your contact data
              </p>
            </div>

            <div className="space-y-4">
              {enrichmentAgents.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedAgents.includes(agent.id);

                return (
                  <motion.div
                    key={agent.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleAgent(agent.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center
                        ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{agent.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600 font-medium">
                              ${agent.cost}/contact
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {agent.features.slice(0, 3).map((feature) => (
                              <span
                                key={feature}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {agent.features.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                +{agent.features.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {agent.accuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedAgents.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Enrichment Summary</span>
                </div>
                <p className="text-sm text-green-800">
                  {selectedAgents.length} agents selected • Estimated cost: ${calculateTotalCost().toFixed(2)} per contact
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review & Start Import
              </h3>
              <p className="text-gray-600">
                Review your settings and start the import process
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Import Source</h4>
                <div className="flex items-center space-x-3">
                  {(() => {
                    const source = integrationSources.find(s => s.id === selectedSource);
                    const Icon = source?.icon;
                    return (
                      <>
                        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
                        <span className="text-gray-700">{source?.name}</span>
                      </>
                    );
                  })()}
                </div>
                {uploadedFile && (
                  <p className="text-sm text-gray-600 mt-1">File: {uploadedFile.name}</p>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Import Settings</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>✓ Skip duplicates: {importConfig.skipDuplicates ? 'Yes' : 'No'}</div>
                  <div>✓ Enrich on import: {importConfig.enrichOnImport ? 'Yes' : 'No'}</div>
                  <div>✓ Auto-tag: {importConfig.autoTag ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {selectedAgents.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Enrichment Agents</h4>
                  <div className="space-y-2">
                    {selectedAgents.map((agentId) => {
                      const agent = enrichmentAgents.find(a => a.id === agentId);
                      return (
                        <div key={agentId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{agent?.name}</span>
                          <span className="text-green-600">${agent?.cost}/contact</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-200">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-purple-900">Total per contact:</span>
                      <span className="text-purple-900">${calculateTotalCost().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Connect CRM</h2>
              <p className="text-sm text-gray-600">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedSource) ||
                  (currentStep === 2 && selectedSource === 'csv-upload' && !uploadedFile)
                }
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleStartImport}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Database className="w-4 h-4" />
                <span>Start Import</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};