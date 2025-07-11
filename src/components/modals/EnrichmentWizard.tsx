import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Database,
  Bot,
  Globe,
  Check,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useCommunications } from '../../hooks/useCommunications';
import { EnrichmentSource, EnrichmentType } from '../../types/communications';

const enrichmentSources = [
  {
    id: 'ai-agent' as EnrichmentSource,
    name: 'AI Agent',
    description: 'Use our advanced AI to enrich contact profiles',
    icon: Bot,
    cost: 0.10,
    accuracy: 85,
    speed: 'Fast'
  },
  {
    id: 'scraper' as EnrichmentSource,
    name: 'Web Scraper',
    description: 'Scrape public information from social profiles',
    icon: Globe,
    cost: 0.05,
    accuracy: 70,
    speed: 'Medium'
  },
  {
    id: 'clearbit' as EnrichmentSource,
    name: 'Clearbit',
    description: 'Professional data from Clearbit API',
    icon: Database,
    cost: 0.25,
    accuracy: 95,
    speed: 'Fast'
  }
];

const enrichmentFields = [
  { id: 'profile', label: 'Profile Info', description: 'Bio, location, website' },
  { id: 'social', label: 'Social Stats', description: 'Followers, engagement rate' },
  { id: 'professional', label: 'Professional', description: 'Company, job title' },
  { id: 'contact_info', label: 'Contact Info', description: 'Email, phone number' }
];

const steps = [
  { id: 1, title: 'Select Sources', description: 'Choose enrichment data sources' },
  { id: 2, title: 'Choose Fields', description: 'Select fields to enrich' },
  { id: 3, title: 'Review & Confirm', description: 'Review settings and costs' },
  { id: 4, title: 'Processing', description: 'Enriching contact data' }
];

export const EnrichmentWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSources, setSelectedSources] = useState<EnrichmentSource[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);

  const { 
    selectedContact, 
    setShowEnrichmentWizard,
    updateContact
  } = useCommunications();

  const handleClose = () => {
    setShowEnrichmentWizard(false);
    setCurrentStep(1);
    setSelectedSources([]);
    setSelectedFields([]);
    setIsProcessing(false);
    setProcessingComplete(false);
  };

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

  const handleStartEnrichment = async () => {
    setIsProcessing(true);
    
    // Simulate enrichment process
    setTimeout(() => {
      setIsProcessing(false);
      setProcessingComplete(true);
      
      // Update contact as enriched
      if (selectedContact) {
        updateContact(selectedContact.id, {
          enriched: true,
          enriched_at: new Date().toISOString(),
          enrichment_source: selectedSources[0]
        });
      }
    }, 3000);
  };

  const toggleSource = (source: EnrichmentSource) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const calculateTotalCost = () => {
    const sourceCost = selectedSources.reduce((total, sourceId) => {
      const source = enrichmentSources.find(s => s.id === sourceId);
      return total + (source?.cost || 0);
    }, 0);
    return sourceCost * selectedFields.length;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Enrichment Sources
              </h3>
              <p className="text-gray-600">
                Choose which data sources to use for enriching {selectedContact?.full_name}'s profile
              </p>
            </div>

            <div className="grid gap-4">
              {enrichmentSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSources.includes(source.id);

                return (
                  <motion.div
                    key={source.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSource(source.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{source.name}</h4>
                          <span className="text-sm font-medium text-green-600">
                            ${source.cost}/field
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Accuracy: {source.accuracy}%</span>
                          <span>Speed: {source.speed}</span>
                        </div>
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
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose Fields to Enrich
              </h3>
              <p className="text-gray-600">
                Select which contact fields you want to enrich
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {enrichmentFields.map((field) => {
                const isSelected = selectedFields.includes(field.id);

                return (
                  <motion.div
                    key={field.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleField(field.id)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{field.label}</h4>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review & Confirm
              </h3>
              <p className="text-gray-600">
                Review your enrichment settings before processing
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedContact?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedContact?.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedContact?.email}</p>
                </div>
              </div>
            </div>

            {/* Selected Sources */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Selected Sources</h4>
              <div className="space-y-2">
                {selectedSources.map((sourceId) => {
                  const source = enrichmentSources.find(s => s.id === sourceId);
                  if (!source) return null;
                  
                  const Icon = source.icon;
                  return (
                    <div key={sourceId} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{source.name}</span>
                      <span className="text-sm text-green-600 ml-auto">${source.cost}/field</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Fields */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Fields to Enrich</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFields.map((fieldId) => {
                  const field = enrichmentFields.find(f => f.id === fieldId);
                  return (
                    <span key={fieldId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {field?.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">Cost Summary</h4>
              </div>
              <div className="text-sm text-green-800">
                <p>{selectedSources.length} sources × {selectedFields.length} fields</p>
                <p className="font-semibold text-lg">Total: ${calculateTotalCost().toFixed(2)}</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            {!processingComplete ? (
              <>
                <div className="w-16 h-16 mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enriching Contact Data
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we gather and process the contact information...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Enrichment Complete!
                  </h3>
                  <p className="text-gray-600">
                    Successfully enriched {selectedContact?.full_name}'s profile with new data.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Updated Profile
                </button>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!selectedContact) return null;

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
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contact Enrichment</h2>
              <p className="text-sm text-gray-600">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
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
            disabled={currentStep === 1 || isProcessing}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep === 3 && (
              <div className="text-sm text-gray-600">
                Total cost: <span className="font-semibold">${calculateTotalCost().toFixed(2)}</span>
              </div>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && selectedSources.length === 0) ||
                  (currentStep === 2 && selectedFields.length === 0)
                }
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : currentStep === 3 ? (
              <button
                onClick={handleStartEnrichment}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Enrichment</span>
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};