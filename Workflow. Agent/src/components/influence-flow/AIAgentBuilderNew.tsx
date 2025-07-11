import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Bot, 
  Settings, 
  Brain, 
  MessageSquare, 
  Zap,
  Plus,
  Trash2,
  TestTube,
  Play,
  Upload,
  Link,
  Globe,
  Mail,
  Database,
  FileText,
  Calendar,
  AlertTriangle,
  User,
  Code,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Edit,
  X,
  Check,
  Clock,
  Webhook,
  Slack,
  Search,
  Filter,
  Building,
  Users,
  MapPin,
  Linkedin,
  Hash,
  Target,
  DollarSign,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  Circle,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  MessageCircle,
  Image,
  Video,
  Mic,
  Type,
  Heart,
  Share,
  BookOpen,
  FolderOpen,
  ExternalLink,
  Download
} from 'lucide-react';

interface AIAgentBuilderNewProps {
  agent?: any | null;
  onBack: () => void;
}

// Tool configuration interface
interface ToolInput {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'email' | 'url' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  letAgentDecide: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: ToolInput[];
  enabled: boolean;
  icon: any;
  color: string;
}

interface KnowledgeItem {
  id: string;
  type: 'file' | 'url' | 'social_media' | 'text' | 'knowledge_base';
  name: string;
  description?: string;
  source?: string;
  metadata?: any;
  addedAt: string;
}

interface SocialMediaPost {
  id: string;
  platform: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'article';
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
  hasMedia: boolean;
  hasTranscription: boolean;
  commentsCount: number;
}

const AIAgentBuilderNew: React.FC<AIAgentBuilderNewProps> = ({ agent, onBack }) => {
  const [activeTab, setActiveTab] = useState('tools');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showToolWizard, setShowToolWizard] = useState(false);
  const [showToolLibrary, setShowToolLibrary] = useState(false);
  const [showNewToolBuilder, setShowNewToolBuilder] = useState(false);
  const [showKnowledgeWizard, setShowKnowledgeWizard] = useState(false);
  const [showSocialMediaWizard, setShowSocialMediaWizard] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);

  const [currentAgent] = useState({
    id: `agent_${Date.now()}`,
    name: 'Marketing Agent',
    description: 'Automate your marketing workflows with intelligent lead processing and engagement.',
    tools: [
      {
        id: 'lead_enrichment',
        name: 'Lead Enrichment',
        description: 'Enrich lead data with comprehensive contact and company information',
        category: 'Data Processing',
        enabled: true,
        icon: Users,
        color: 'bg-blue-500',
        inputs: [
          {
            id: 'job_title',
            name: 'Job title',
            description: "The contact's job title",
            type: 'text',
            required: false,
            letAgentDecide: true
          },
          {
            id: 'company_size',
            name: 'Company size',
            description: 'Number of employees (integer values only)',
            type: 'number',
            required: false,
            letAgentDecide: true
          },
          {
            id: 'industry',
            name: 'Industry',
            description: "The contact's industry",
            type: 'text',
            required: false,
            letAgentDecide: true
          },
          {
            id: 'email_category',
            name: 'Email category',
            description: 'work email or personal email',
            type: 'select',
            options: ['work email', 'personal email'],
            required: false,
            letAgentDecide: true
          }
        ]
      },
      {
        id: 'lead_scoring',
        name: 'Lead Scoring',
        description: 'Score and qualify leads based on predefined criteria',
        category: 'Analysis',
        enabled: false,
        icon: Target,
        color: 'bg-green-500',
        inputs: [
          {
            id: 'current_job_title',
            name: 'Current job title',
            description: 'Input the current job title of the user',
            type: 'text',
            required: false,
            letAgentDecide: true
          },
          {
            id: 'personal_linkedin_url',
            name: 'Personal LinkedIn URL',
            description: 'LinkedIn profile URL',
            type: 'url',
            required: false,
            letAgentDecide: true
          }
        ]
      },
      {
        id: 'company_lookup',
        name: 'Company Lookup',
        description: 'Research and gather company information',
        category: 'Research',
        enabled: false,
        icon: Building,
        color: 'bg-purple-500',
        inputs: [
          {
            id: 'company_name',
            name: 'Company name',
            description: "The company's name",
            type: 'text',
            required: false,
            letAgentDecide: true
          },
          {
            id: 'email',
            name: 'Email',
            description: "Contact email address",
            type: 'email',
            required: false,
            letAgentDecide: true
          }
        ]
      },
      {
        id: 'email_validator',
        name: 'Email Validator',
        description: 'Validate and verify email addresses',
        category: 'Validation',
        enabled: false,
        icon: Mail,
        color: 'bg-orange-500',
        inputs: [
          {
            id: 'email_address',
            name: 'Email address',
            description: 'The email address to validate',
            type: 'email',
            required: true,
            letAgentDecide: false
          }
        ]
      }
    ]
  });

  const tabs = [
    { id: 'prompt', label: 'Prompt', icon: Brain, color: 'text-purple-600' },
    { id: 'tools', label: 'Tools', icon: Zap, color: 'text-blue-600' },
    { id: 'knowledge', label: 'Knowledge', icon: FileText, color: 'text-green-600' },
    { id: 'triggers', label: 'Triggers', icon: Calendar, color: 'text-yellow-600' },
    { id: 'escalations', label: 'Escalations', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'metadata', label: 'Metadata', icon: Settings, color: 'text-gray-600' },
    { id: 'variables', label: 'Variables', icon: Code, color: 'text-indigo-600' }
  ];

  const toggleToolEnabled = (toolId: string) => {
    // Tool toggle logic here
  };

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'email':
        return Mail;
      case 'url':
        return Link;
      case 'number':
        return Hash;
      case 'select':
        return ChevronDown;
      default:
        return FileText;
    }
  };

  const addKnowledgeItem = (item: Omit<KnowledgeItem, 'id' | 'addedAt'>) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: `knowledge_${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    setKnowledgeItems(prev => [...prev, newItem]);
  };

  const removeKnowledgeItem = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
  };

  // URL Import Wizard Component
  const UrlImportWizard = ({ onClose }: { onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [importType, setImportType] = useState<'single' | 'batch'>('single');
    const [singleUrl, setSingleUrl] = useState('');
    const [batchUrls, setBatchUrls] = useState('');
    const [urlList, setUrlList] = useState<string[]>([]);

    const steps = [
      { id: 'type', title: 'Import Type', icon: Link },
      { id: 'urls', title: 'Add URLs', icon: Globe },
      { id: 'review', title: 'Review & Import', icon: CheckCircle }
    ];

    const handleBatchUrlsChange = (value: string) => {
      setBatchUrls(value);
      const urls = value.split('\n').filter(url => url.trim() !== '');
      setUrlList(urls);
    };

    const handleImport = () => {
      const urls = importType === 'single' ? [singleUrl] : urlList;
      urls.forEach((url, index) => {
        if (url.trim()) {
          addKnowledgeItem({
            type: 'url',
            name: `URL Import ${index + 1}`,
            description: url,
            source: url,
            metadata: { importType, importedAt: new Date().toISOString() }
          });
        }
      });
      onClose();
    };

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Link className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Import URLs</h3>
                <p className="text-gray-600">Choose how you want to import URLs to your knowledge base</p>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => setImportType('single')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    importType === 'single' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      importType === 'single' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {importType === 'single' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Single URL</h4>
                      <p className="text-sm text-gray-600">Import one URL at a time</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setImportType('batch')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    importType === 'batch' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      importType === 'batch' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {importType === 'batch' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Batch Import</h4>
                      <p className="text-sm text-gray-600">Import multiple URLs at once</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );

        case 1:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {importType === 'single' ? 'Add URL' : 'Add URLs'}
                </h3>
                <p className="text-gray-600">
                  {importType === 'single' 
                    ? 'Enter the URL you want to import' 
                    : 'Enter multiple URLs, one per line'
                  }
                </p>
              </div>

              {importType === 'single' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URLs (one per line)
                  </label>
                  <textarea
                    value={batchUrls}
                    onChange={(e) => handleBatchUrlsChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={8}
                    placeholder={`https://example.com/page1
https://example.com/page2
https://example.com/page3`}
                  />
                  {urlList.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {urlList.length} URL{urlList.length !== 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>
              )}
            </div>
          );

        case 2:
          const reviewUrls = importType === 'single' ? [singleUrl] : urlList;
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review URLs</h3>
                <p className="text-gray-600">Confirm the URLs you want to import</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-gray-900 mb-3">
                  {reviewUrls.length} URL{reviewUrls.length !== 1 ? 's' : ''} to import:
                </h4>
                <div className="space-y-2">
                  {reviewUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate flex-1">{url}</span>
                    </div>
                  ))}
                </div>
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
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : index === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 1 && importType === 'single' && !singleUrl.trim()) ||
                      (currentStep === 1 && importType === 'batch' && urlList.length === 0)
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleImport}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Import URLs
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Enhanced Social Media Wizard Component
  const SocialMediaWizard = ({ onClose }: { onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [contentType, setContentType] = useState<'all' | 'specific'>('all');
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [contentParts, setContentParts] = useState({
      media: true,
      transcription: true,
      comments: false,
      commentsCount: 10,
      captions: true,
      metadata: true
    });

    const platforms = [
      { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
      { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-blue-400' },
      { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500' },
      { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-700' }
    ];

    const mockAccounts = {
      instagram: [
        { id: 'acc1', name: '@johndoe', followers: '12.5K' },
        { id: 'acc2', name: '@business_account', followers: '45.2K' }
      ],
      linkedin: [
        { id: 'acc3', name: 'John Doe', type: 'Personal Profile' },
        { id: 'acc4', name: 'Company Page', type: 'Business Page' }
      ],
      twitter: [
        { id: 'acc5', name: '@johndoe', followers: '8.3K' }
      ]
    };

    const mockPosts: SocialMediaPost[] = [
      {
        id: 'post1',
        platform: 'instagram',
        type: 'post',
        title: 'Marketing Tips for 2024',
        description: 'Here are the top 5 marketing strategies...',
        url: 'https://instagram.com/p/abc123',
        publishedAt: '2024-01-15',
        metrics: { likes: 245, comments: 18, shares: 12 },
        hasMedia: true,
        hasTranscription: false,
        commentsCount: 18
      },
      {
        id: 'post2',
        platform: 'instagram',
        type: 'reel',
        title: 'Quick Social Media Hack',
        description: 'This one trick will boost your engagement...',
        url: 'https://instagram.com/reel/def456',
        publishedAt: '2024-01-12',
        metrics: { likes: 1200, comments: 89, shares: 156, views: 15000 },
        hasMedia: true,
        hasTranscription: true,
        commentsCount: 89
      }
    ];

    const steps = [
      { id: 'platform', title: 'Select Platform', icon: Globe },
      { id: 'account', title: 'Choose Account', icon: User },
      { id: 'content', title: 'Select Content', icon: FileText },
      { id: 'parts', title: 'Content Parts', icon: Settings },
      { id: 'review', title: 'Review & Import', icon: CheckCircle }
    ];

    const handleImport = () => {
      const platform = platforms.find(p => p.id === selectedPlatform);
      const account = mockAccounts[selectedPlatform]?.find(a => a.id === selectedAccount);
      
      addKnowledgeItem({
        type: 'social_media',
        name: `${platform?.name} - ${account?.name}`,
        description: `Imported ${contentType === 'all' ? 'all content' : `${selectedPosts.length} posts`} from ${platform?.name}`,
        source: selectedPlatform,
        metadata: {
          platform: selectedPlatform,
          account: selectedAccount,
          contentType,
          selectedPosts: contentType === 'specific' ? selectedPosts : [],
          contentParts,
          importedAt: new Date().toISOString()
        }
      });
      onClose();
    };

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Platform</h3>
                <p className="text-gray-600">Choose the social media platform to import content from</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPlatform === platform.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center`}>
                        <platform.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 1:
          const accounts = mockAccounts[selectedPlatform] || [];
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Account</h3>
                <p className="text-gray-600">Select the account to import content from</p>
              </div>

              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedAccount(account.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedAccount === account.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAccount === account.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedAccount === account.id && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{account.name}</h4>
                        <p className="text-sm text-gray-600">
                          {account.followers || account.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 2:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Content</h3>
                <p className="text-gray-600">Choose what content to import</p>
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => setContentType('all')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    contentType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      contentType === 'all' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {contentType === 'all' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">All Content</h4>
                      <p className="text-sm text-gray-600">Import all posts from this account</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setContentType('specific')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    contentType === 'specific' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      contentType === 'specific' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {contentType === 'specific' && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Specific Posts</h4>
                      <p className="text-sm text-gray-600">Choose individual posts to import</p>
                    </div>
                  </div>
                </div>
              </div>

              {contentType === 'specific' && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Select Posts</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {mockPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          setSelectedPosts(prev => 
                            prev.includes(post.id) 
                              ? prev.filter(id => id !== post.id)
                              : [...prev, post.id]
                          );
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedPosts.includes(post.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded border mt-1 ${
                            selectedPosts.includes(post.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {selectedPosts.includes(post.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{post.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{post.type}</span>
                              <span>{post.metrics.likes} likes</span>
                              <span>{post.metrics.comments} comments</span>
                              {post.hasTranscription && <span>Has transcription</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );

        case 3:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Parts</h3>
                <p className="text-gray-600">Choose what parts of the content to extract</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Media (Images/Videos)</h4>
                      <p className="text-sm text-gray-600">Extract media files from posts</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentParts.media}
                      onChange={(e) => setContentParts(prev => ({ ...prev, media: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Captions & Text</h4>
                      <p className="text-sm text-gray-600">Extract post captions and text content</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentParts.captions}
                      onChange={(e) => setContentParts(prev => ({ ...prev, captions: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Transcriptions</h4>
                      <p className="text-sm text-gray-600">Extract video/audio transcriptions</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentParts.transcription}
                      onChange={(e) => setContentParts(prev => ({ ...prev, transcription: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Comments</h4>
                        <p className="text-sm text-gray-600">Extract comments from posts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contentParts.comments}
                        onChange={(e) => setContentParts(prev => ({ ...prev, comments: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {contentParts.comments && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of comments to extract
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={contentParts.commentsCount}
                        onChange={(e) => setContentParts(prev => ({ ...prev, commentsCount: parseInt(e.target.value) || 10 }))}
                        className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Metadata</h4>
                      <p className="text-sm text-gray-600">Extract engagement metrics and post data</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contentParts.metadata}
                      onChange={(e) => setContentParts(prev => ({ ...prev, metadata: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          );

        case 4:
          const platform = platforms.find(p => p.id === selectedPlatform);
          const account = mockAccounts[selectedPlatform]?.find(a => a.id === selectedAccount);
          const selectedContentParts = Object.entries(contentParts).filter(([key, value]) => value && key !== 'commentsCount');
          
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Import</h3>
                <p className="text-gray-600">Confirm your social media content import settings</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Platform & Account</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${platform?.color} rounded-lg flex items-center justify-center`}>
                      {platform && <platform.icon className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-gray-700">{platform?.name} - {account?.name}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content Selection</h4>
                  <p className="text-gray-700">
                    {contentType === 'all' ? 'All content' : `${selectedPosts.length} specific posts`}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content Parts ({selectedContentParts.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContentParts.map(([key]) => (
                      <span key={key} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full capitalize">
                        {key === 'captions' ? 'Captions & Text' : key}
                        {key === 'comments' && contentParts.comments && ` (${contentParts.commentsCount})`}
                      </span>
                    ))}
                  </div>
                </div>
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
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : index === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 0 && !selectedPlatform) ||
                      (currentStep === 1 && !selectedAccount) ||
                      (currentStep === 2 && contentType === 'specific' && selectedPosts.length === 0)
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleImport}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Import Content
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Tool Wizard Component
  const ToolWizard = ({ tool, onClose }: { tool: Tool; onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [toolConfig, setToolConfig] = useState({
      description: tool.description,
      inputs: tool.inputs
    });

    const steps = [
      { id: 'description', title: 'Tool Description', icon: MessageSquare },
      { id: 'inputs', title: 'Configure Inputs', icon: Settings },
      { id: 'review', title: 'Review & Save', icon: CheckCircle }
    ];

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600">{tool.category}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How should the agent use this tool?
                </label>
                <textarea
                  value={toolConfig.description}
                  onChange={(e) => setToolConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Describe how the agent should use this tool..."
                />
              </div>
            </div>
          );

        case 1:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Configure Tool Inputs</h3>
                <p className="text-gray-600">Set up the data this tool needs to work</p>
              </div>

              <div className="space-y-4">
                {toolConfig.inputs.map((input, index) => {
                  const InputIcon = getInputIcon(input.type);
                  return (
                    <div key={input.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <InputIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{input.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{input.description}</p>
                          </div>

                          {input.type === 'select' && input.options && (
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <option value="">Select an option...</option>
                              {input.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}

                          {input.type !== 'select' && (
                            <input
                              type={input.type === 'number' ? 'number' : input.type === 'email' ? 'email' : input.type === 'url' ? 'url' : 'text'}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Enter ${input.name.toLowerCase()}...`}
                              defaultValue={input.defaultValue || ''}
                            />
                          )}

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={input.letAgentDecide}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Let agent decide</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={input.required}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Required</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );

        case 2:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Configuration</h3>
                <p className="text-gray-600">Confirm your tool setup before saving</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tool Description</h4>
                  <p className="text-gray-700 text-sm">{toolConfig.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Configured Inputs ({toolConfig.inputs.length})</h4>
                  <div className="space-y-2">
                    {toolConfig.inputs.map((input) => (
                      <div key={input.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-900">{input.name}</span>
                        <div className="flex items-center gap-2">
                          {input.letAgentDecide && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Auto</span>
                          )}
                          {input.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Required</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Wizard Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Tools</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : index === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderStepContent()}
          </div>

          {/* Wizard Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Save tool configuration
                      onClose();
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Tool
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Tool Library Modal Component
  const ToolLibraryModal = ({ onClose, onSelectTool }: { onClose: () => void; onSelectTool: (tool: any) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('trending');

    const trendingTools = [
      {
        id: 'add_answer_to_knowledge',
        name: 'Add Answer to Knowledge Base',
        description: 'Add AI-generated answers to your knowledge base',
        author: 'Relevance AI',
        verified: true,
        icon: BookOpen,
        color: 'bg-green-500'
      },
      {
        id: 'add_comment_to_notion',
        name: 'Add Comment to Notion',
        description: 'Add comments to Notion pages',
        author: 'Relevance AI',
        verified: true,
        icon: MessageSquare,
        color: 'bg-gray-800'
      },
      {
        id: 'add_comment_to_trello',
        name: 'Add Comment to Trello Card',
        description: 'Add comments to Trello cards',
        author: 'Relevance AI',
        verified: true,
        icon: MessageSquare,
        color: 'bg-blue-500'
      },
      {
        id: 'google_play_reviews',
        name: 'Add Google Play Store Reviews to Knowledge',
        description: 'Import Google Play Store reviews',
        author: 'Relevance AI',
        verified: true,
        icon: Download,
        color: 'bg-green-600'
      }
    ];

    const categories = [
      { id: 'all', name: 'All tools' },
      { id: 'trending', name: 'Trending' },
      { id: 'your_tools', name: 'Your tools' }
    ];

    const useCaseCategories = [
      { id: 'communications', name: 'Communications' },
      { id: 'crm', name: 'CRM' },
      { id: 'calendar', name: 'Calendar' },
      { id: 'data_scraper', name: 'Data scraper' },
      { id: 'handle_files', name: 'Handle files' },
      { id: 'knowledge', name: 'Knowledge' }
    ];

    const appCategories = [
      { id: 'gmail', name: 'Gmail', icon: Mail },
      { id: 'google_calendar', name: 'Google Calendar', icon: Calendar },
      { id: 'hubspot', name: 'HubSpot', icon: Building },
      { id: 'outlook', name: 'Outlook', icon: Mail },
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
      { id: 'notion', name: 'Notion', icon: FileText },
      { id: 'slack', name: 'Slack', icon: Slack }
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tools</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewToolBuilder(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New tool
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search 9,000+ tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex h-[calc(90vh-140px)]">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Tools Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tools</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* By use case */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">By use case</h3>
                  <div className="space-y-1">
                    {useCaseCategories.map((category) => (
                      <button
                        key={category.id}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* By apps */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">By apps</h3>
                  <div className="space-y-1">
                    {appCategories.map((app) => (
                      <button
                        key={app.id}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <app.icon className="w-4 h-4" />
                        {app.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trending</h3>
                <p className="text-gray-600">Popular tool templates from the community</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool);
                      onClose();
                    }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{tool.name}</h4>
                          {tool.verified && (
                            <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                        <p className="text-xs text-gray-500">by {tool.author}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // New Tool Builder Component
  const NewToolBuilder = ({ onClose }: { onClose: () => void }) => {
    const [toolName, setToolName] = useState('');
    const [toolDescription, setToolDescription] = useState('');
    const [inputs, setInputs] = useState<any[]>([]);
    const [steps, setSteps] = useState<any[]>([]);
    const [showStepLibrary, setShowStepLibrary] = useState(false);

    const inputTypes = [
      { id: 'text', name: 'Text', icon: Type },
      { id: 'long_text', name: 'Long text', icon: FileText },
      { id: 'number', name: 'Number', icon: Hash },
      { id: 'json', name: 'JSON', icon: Code },
      { id: 'file_to_url', name: 'File to URL', icon: Link },
      { id: 'table', name: 'Table', icon: Database },
      { id: 'more', name: 'More', icon: Plus }
    ];

    const stepTypes = [
      { id: 'llm', name: 'LLM', icon: Brain },
      { id: 'knowledge', name: 'Knowledge', icon: BookOpen },
      { id: 'google', name: 'Google', icon: Search },
      { id: 'api', name: 'API', icon: Globe },
      { id: 'python', name: 'Python', icon: Code }
    ];

    const addInput = (type: string) => {
      const newInput = {
        id: `input_${Date.now()}`,
        type,
        name: `${type} input`,
        description: '',
        required: false
      };
      setInputs(prev => [...prev, newInput]);
    };

    const addStep = (type: string) => {
      const newStep = {
        id: `step_${Date.now()}`,
        type,
        name: `${type} step`,
        config: {}
      };
      setSteps(prev => [...prev, newStep]);
      setShowStepLibrary(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white z-50"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Tools</span>
              </button>
              <div className="text-gray-300">/</div>
              <div className="text-gray-600">Untitled tool</div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Save changes
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run tool
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          {/* Tool Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="Type title..."
                className="text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none placeholder-gray-400"
              />
              <div className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                Unsaved
              </div>
            </div>
            <input
              type="text"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              placeholder="Type short description..."
              className="text-gray-600 bg-transparent border-none outline-none placeholder-gray-400 w-full"
            />
          </div>

          {/* Inputs Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Inputs</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  For Agent
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">Add type of input:</div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {inputTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addInput(type.id)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <type.icon className="w-4 h-4" />
                  {type.name}
                </button>
              ))}
            </div>

            {inputs.length > 0 && (
              <div className="space-y-3">
                {inputs.map((input) => (
                  <div key={input.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{input.name}</h4>
                        <p className="text-sm text-gray-600">{input.type}</p>
                      </div>
                      <button
                        onClick={() => setInputs(prev => prev.filter(i => i.id !== input.id))}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Steps Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-6">
              Define the logic of your tool. Chain together LLM prompts, call APIs, run code and more.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setShowStepLibrary(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
              {stepTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addStep(type.id)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <type.icon className="w-4 h-4" />
                  {type.name}
                </button>
              ))}
            </div>

            {steps.length > 0 && (
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{step.name}</h4>
                        <p className="text-sm text-gray-600">{step.type}</p>
                      </div>
                      <button
                        onClick={() => setSteps(prev => prev.filter(s => s.id !== step.id))}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step Library Modal */}
        {showStepLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Step</h3>
                  <button
                    onClick={() => setShowStepLibrary(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search 9,000+ tool steps..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'api', name: 'API', description: 'Run an API request', verified: true, icon: Globe },
                    { id: 'extract_website', name: 'Extract website content', description: 'Scrape and access website content from a link or URL', verified: true, icon: ExternalLink },
                    { id: 'google_search', name: 'Google Search', description: 'Search the web for keywords using Google and get the top website results', verified: true, icon: Search },
                    { id: 'javascript', name: 'Javascript Code', description: 'Run Javascript code', verified: true, icon: Code },
                    { id: 'llm', name: 'LLM', description: 'Use a large language model such as GPT', verified: true, icon: Brain },
                    { id: 'llm_vision', name: 'LLM Vision', description: 'Use a large multimodal model such as GPT4o or Gemini 1.5 Pro', verified: true, icon: Eye },
                    { id: 'note', name: 'Note', description: 'Insert markdown notes', verified: true, icon: FileText },
                    { id: 'python', name: 'Python Code', description: 'Run Python code', verified: true, icon: Code }
                  ].map((step) => (
                    <div
                      key={step.id}
                      onClick={() => addStep(step.id)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{step.name}</h4>
                            {step.verified && (
                              <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Verified
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Knowledge Wizard Component
  const KnowledgeWizard = ({ onClose }: { onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState('');
    const [selectedResources, setSelectedResources] = useState<string[]>([]);

    const steps = [
      { id: 'knowledge_base', title: 'Select Knowledge Base', icon: Database },
      { id: 'resources', title: 'Choose Resources', icon: FolderOpen },
      { id: 'review', title: 'Review & Add', icon: CheckCircle }
    ];

    // Mock knowledge bases - replace with actual Supabase query
    const knowledgeBases = [
      { id: 'kb1', name: 'Marketing Knowledge', description: 'Marketing strategies and content', resourceCount: 45 },
      { id: 'kb2', name: 'Product Documentation', description: 'Product guides and tutorials', resourceCount: 23 },
      { id: 'kb3', name: 'Customer Support', description: 'Support articles and FAQs', resourceCount: 67 }
    ];

    // Mock resources - replace with actual Supabase query based on selected knowledge base
    const resources = [
      { id: 'res1', name: 'Social Media Strategy Guide', type: 'document', size: '2.3 MB' },
      { id: 'res2', name: 'Content Calendar Template', type: 'spreadsheet', size: '1.1 MB' },
      { id: 'res3', name: 'Brand Guidelines', type: 'document', size: '5.7 MB' },
      { id: 'res4', name: 'Marketing Metrics Dashboard', type: 'data', size: '890 KB' }
    ];

    const handleAddKnowledge = () => {
      const knowledgeBase = knowledgeBases.find(kb => kb.id === selectedKnowledgeBase);
      const selectedResourceItems = resources.filter(r => selectedResources.includes(r.id));
      
      addKnowledgeItem({
        type: 'knowledge_base',
        name: `${knowledgeBase?.name} - ${selectedResourceItems.length} resources`,
        description: `Selected ${selectedResourceItems.length} resources from ${knowledgeBase?.name}`,
        source: selectedKnowledgeBase,
        metadata: {
          knowledgeBaseId: selectedKnowledgeBase,
          resourceIds: selectedResources,
          resources: selectedResourceItems
        }
      });
      onClose();
    };

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Knowledge Base</h3>
                <p className="text-gray-600">Choose a knowledge base to import resources from</p>
              </div>

              <div className="space-y-3">
                {knowledgeBases.map((kb) => (
                  <div
                    key={kb.id}
                    onClick={() => setSelectedKnowledgeBase(kb.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedKnowledgeBase === kb.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedKnowledgeBase === kb.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedKnowledgeBase === kb.id && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{kb.name}</h4>
                        <p className="text-sm text-gray-600">{kb.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{kb.resourceCount} resources</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 1:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Resources</h3>
                <p className="text-gray-600">Select the resources you want to add to your agent</p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    onClick={() => {
                      setSelectedResources(prev => 
                        prev.includes(resource.id) 
                          ? prev.filter(id => id !== resource.id)
                          : [...prev, resource.id]
                      );
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedResources.includes(resource.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border ${
                        selectedResources.includes(resource.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedResources.includes(resource.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="capitalize">{resource.type}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 2:
          const knowledgeBase = knowledgeBases.find(kb => kb.id === selectedKnowledgeBase);
          const selectedResourceItems = resources.filter(r => selectedResources.includes(r.id));
          
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Add</h3>
                <p className="text-gray-600">Confirm the knowledge resources to add to your agent</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Knowledge Base</h4>
                  <p className="text-gray-700">{knowledgeBase?.name}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Selected Resources ({selectedResourceItems.length})</h4>
                  <div className="space-y-2">
                    {selectedResourceItems.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-900">{resource.name}</span>
                        <span className="text-xs text-gray-500">{resource.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      index < currentStep 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : index === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 0 && !selectedKnowledgeBase) ||
                      (currentStep === 1 && selectedResources.length === 0)
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleAddKnowledge}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Knowledge
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Text Editor Modal Component
  const TextEditorModal = ({ onClose }: { onClose: () => void }) => {
    const [textContent, setTextContent] = useState('');
    const [title, setTitle] = useState('');

    const handleSave = () => {
      if (textContent.trim()) {
        addKnowledgeItem({
          type: 'text',
          name: title || 'Text Knowledge',
          description: textContent.substring(0, 100) + (textContent.length > 100 ? '...' : ''),
          source: 'manual_entry',
          metadata: { content: textContent, wordCount: textContent.split(' ').length }
        });
        onClose();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Text Knowledge</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a title for this knowledge..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={12}
                placeholder="Enter your text content here..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {textContent.split(' ').filter(word => word.length > 0).length} words
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!textContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Knowledge
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Tools Tab Component
  const ToolsTab = () => {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentAgent.name}</h2>
            <p className="text-gray-600 mt-1">{currentAgent.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Build
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentAgent.tools.map((tool: Tool) => (
            <div key={tool.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={() => toggleToolEnabled(tool.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {tool.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {tool.inputs.length} input{tool.inputs.length !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => {
                    setSelectedTool(tool);
                    setShowToolWizard(true);
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}

          {/* Add New Tool Card */}
          <div 
            onClick={() => setShowToolLibrary(true)}
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Add New Tool</h3>
            <p className="text-sm text-gray-600">Extend your agent's capabilities</p>
          </div>
        </div>

        {/* Variables Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Variables</h3>
              <p className="text-sm text-gray-600">
                Reuse values throughout your agent with variables like <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{'{{customer_name}}'}</code>
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium mb-1">No variables defined</p>
            <p className="text-sm">Create variables to reuse data across your agent</p>
          </div>
        </div>
      </div>
    );
  };

  // Knowledge Tab Component
  const KnowledgeTab = () => {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Knowledge</h2>
          <p className="text-gray-600">Import data to teach your agents about new topics.</p>
        </div>

        {/* Upload Knowledge Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload knowledge</h3>
          
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-2">
              Drag & drop or <button className="text-blue-600 hover:text-blue-700">choose files</button> to upload.
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Supported formats: .csv, .json, .pdf, .xlsx, .xls, .txt, .md, .docx, .pptx.
            </p>
            <p className="text-sm text-gray-500">Max 5 files per upload.</p>
          </div>

          <div className="text-center text-gray-500 mb-6">or</div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowKnowledgeWizard(true)}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Database className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Add existing knowledge</span>
            </button>

            <button
              onClick={() => setShowUrlImport(true)}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Globe className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Import URL</span>
            </button>

            <button
              onClick={() => setShowSocialMediaWizard(true)}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Instagram className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Import Social Media Content</span>
            </button>

            <button
              onClick={() => setShowTextEditor(true)}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Type className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Text</span>
            </button>
          </div>
        </div>

        {/* Knowledge Items List */}
        {knowledgeItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Added Knowledge ({knowledgeItems.length})</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Manage all
              </button>
            </div>

            <div className="space-y-3">
              {knowledgeItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.type === 'url' && <Globe className="w-5 h-5 text-gray-600" />}
                      {item.type === 'social_media' && <Instagram className="w-5 h-5 text-gray-600" />}
                      {item.type === 'text' && <Type className="w-5 h-5 text-gray-600" />}
                      {item.type === 'knowledge_base' && <Database className="w-5 h-5 text-gray-600" />}
                      {item.type === 'file' && <FileText className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeKnowledgeItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tools':
        return <ToolsTab />;
      case 'knowledge':
        return <KnowledgeTab />;
      case 'prompt':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Prompt Configuration</h3>
            <p className="text-gray-600">Configure your agent's personality and instructions.</p>
          </div>
        );
      case 'triggers':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Automation Triggers</h3>
            <p className="text-gray-600">Set up when and how your agent should run automatically.</p>
          </div>
        );
      case 'escalations':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Escalation Rules</h3>
            <p className="text-gray-600">Define fallback actions when your agent needs help.</p>
          </div>
        );
      case 'metadata':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Metadata</h3>
            <p className="text-gray-600">General information and settings for your agent.</p>
          </div>
        );
      case 'variables':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Code className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Global Variables</h3>
            <p className="text-gray-600">Define reusable variables for your agent workflows.</p>
          </div>
        );
      default:
        return <ToolsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Agents</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentAgent.name}
              </h1>
              <p className="text-sm text-gray-600">AI Agent Configuration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test Agent
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Agent
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showToolWizard && selectedTool && (
          <ToolWizard
            tool={selectedTool}
            onClose={() => {
              setShowToolWizard(false);
              setSelectedTool(null);
            }}
          />
        )}

        {showToolLibrary && (
          <ToolLibraryModal
            onClose={() => setShowToolLibrary(false)}
            onSelectTool={(tool) => {
              // Handle tool selection
              setShowToolLibrary(false);
            }}
          />
        )}

        {showNewToolBuilder && (
          <NewToolBuilder
            onClose={() => setShowNewToolBuilder(false)}
          />
        )}

        {showKnowledgeWizard && (
          <KnowledgeWizard
            onClose={() => setShowKnowledgeWizard(false)}
          />
        )}

        {showSocialMediaWizard && (
          <SocialMediaWizard
            onClose={() => setShowSocialMediaWizard(false)}
          />
        )}

        {showTextEditor && (
          <TextEditorModal
            onClose={() => setShowTextEditor(false)}
          />
        )}

        {showUrlImport && (
          <UrlImportWizard
            onClose={() => setShowUrlImport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAgentBuilderNew;