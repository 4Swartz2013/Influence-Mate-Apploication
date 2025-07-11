'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EnrichmentJob } from '@/lib/supabase'
import { 
  ArrowRight, 
  Globe, 
  Search, 
  Database, 
  Brain,
  Link,
  Mail,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SourceChainViewerProps {
  job: EnrichmentJob
}

interface SourceStep {
  name: string
  description: string
  status: 'completed' | 'failed' | 'pending'
  timestamp?: string
  data?: any
}

export function SourceChainViewer({ job }: SourceChainViewerProps) {
  // Extract source chain from job parameters or results
  const getSourceChain = (): SourceStep[] => {
    // Try to get from job results first
    if (job.results && typeof job.results === 'object') {
      const results = job.results as any
      if (results.source_chain) {
        return results.source_chain
      }
    }

    // Try to get from job parameters
    if (job.parameters && typeof job.parameters === 'object') {
      const params = job.parameters as any
      if (params.source_chain) {
        return params.source_chain
      }
    }

    // Generate default chain based on job type
    return generateDefaultChain(job)
  }

  const generateDefaultChain = (job: EnrichmentJob): SourceStep[] => {
    const baseSteps: SourceStep[] = []

    switch (job.job_type) {
      case 'contact_enrichment':
        return [
          {
            name: 'Profile Discovery',
            description: 'Located social media profiles',
            status: 'completed'
          },
          {
            name: 'Bio Analysis',
            description: 'Extracted bio and profile information',
            status: 'completed'
          },
          {
            name: 'Link Extraction',
            description: 'Found external links and websites',
            status: 'completed'
          },
          {
            name: 'Email Discovery',
            description: 'Attempted email address discovery',
            status: job.status === 'completed' ? 'completed' : 'failed'
          }
        ]

      case 'persona_analysis':
        return [
          {
            name: 'Data Aggregation',
            description: 'Collected contact profiles and content',
            status: 'completed'
          },
          {
            name: 'AI Analysis',
            description: 'Processed data through Gemini AI',
            status: 'completed'
          },
          {
            name: 'Persona Generation',
            description: 'Generated persona labels and insights',
            status: job.status === 'completed' ? 'completed' : 'failed'
          },
          {
            name: 'Insight Storage',
            description: 'Saved results to database',
            status: job.status === 'completed' ? 'completed' : 'failed'
          }
        ]

      case 'sentiment_analysis':
        return [
          {
            name: 'Content Collection',
            description: 'Gathered comments and posts',
            status: 'completed'
          },
          {
            name: 'Text Processing',
            description: 'Cleaned and prepared text data',
            status: 'completed'
          },
          {
            name: 'Sentiment Scoring',
            description: 'Applied sentiment analysis models',
            status: job.status === 'completed' ? 'completed' : 'failed'
          }
        ]

      case 'audience_clustering':
        return [
          {
            name: 'Feature Extraction',
            description: 'Analyzed contact characteristics',
            status: 'completed'
          },
          {
            name: 'Similarity Calculation',
            description: 'Computed contact similarities',
            status: 'completed'
          },
          {
            name: 'Cluster Formation',
            description: 'Grouped similar contacts',
            status: job.status === 'completed' ? 'completed' : 'failed'
          }
        ]

      default:
        return [
          {
            name: 'Job Initialization',
            description: 'Started processing job',
            status: 'completed'
          },
          {
            name: 'Data Processing',
            description: 'Processed input data',
            status: job.status === 'completed' ? 'completed' : job.status === 'failed' ? 'failed' : 'pending'
          },
          {
            name: 'Result Generation',
            description: 'Generated output results',
            status: job.status === 'completed' ? 'completed' : 'pending'
          }
        ]
    }
  }

  const getStepIcon = (step: SourceStep) => {
    const iconClass = "w-4 h-4"
    
    if (step.name.toLowerCase().includes('profile') || step.name.toLowerCase().includes('discovery')) {
      return <Search className={iconClass} />
    }
    if (step.name.toLowerCase().includes('bio') || step.name.toLowerCase().includes('analysis')) {
      return <Brain className={iconClass} />
    }
    if (step.name.toLowerCase().includes('link') || step.name.toLowerCase().includes('website')) {
      return <Link className={iconClass} />
    }
    if (step.name.toLowerCase().includes('email')) {
      return <Mail className={iconClass} />
    }
    if (step.name.toLowerCase().includes('instagram')) {
      return <Instagram className={iconClass} />
    }
    if (step.name.toLowerCase().includes('twitter')) {
      return <Twitter className={iconClass} />
    }
    if (step.name.toLowerCase().includes('youtube')) {
      return <Youtube className={iconClass} />
    }
    if (step.name.toLowerCase().includes('linkedin')) {
      return <Linkedin className={iconClass} />
    }
    if (step.name.toLowerCase().includes('database') || step.name.toLowerCase().includes('storage')) {
      return <Database className={iconClass} />
    }
    
    return <Globe className={iconClass} />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      case 'pending':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-slate-200 bg-slate-50'
    }
  }

  const sourceChain = getSourceChain()

  if (sourceChain.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Source Chain</CardTitle>
        <CardDescription>
          Step-by-step processing pipeline for this enrichment job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sourceChain.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className={`border rounded-lg p-4 ${getStatusColor(step.status)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">{step.name}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(step.status)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            step.status === 'completed' ? 'border-green-300 text-green-700' :
                            step.status === 'failed' ? 'border-red-300 text-red-700' :
                            'border-yellow-300 text-yellow-700'
                          }`}
                        >
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                    
                    {step.data && (
                      <div className="mt-2 p-2 bg-white/50 rounded border">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                          {typeof step.data === 'string' ? step.data : JSON.stringify(step.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < sourceChain.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {sourceChain.filter(s => s.status === 'completed').length} of {sourceChain.length} steps completed
            </span>
            <span className="text-slate-600">
              {sourceChain.filter(s => s.status === 'failed').length > 0 && 
                `${sourceChain.filter(s => s.status === 'failed').length} failed`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}