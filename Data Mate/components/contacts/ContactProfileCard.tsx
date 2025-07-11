'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ContactTagManager } from './ContactTagManager'
import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator'
import { ConfidenceBadge } from '@/components/confidence/ConfidenceBadge'
import { FieldConfidenceBadge } from '@/components/confidence/FieldConfidenceBadge'
import { Contact } from '@/lib/supabase'
import { 
  ExternalLink, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Star,
  Shield
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ContactProfileCardProps {
  contact: Contact
  onContactUpdate: () => void
}

export function ContactProfileCard({ contact, onContactUpdate }: ContactProfileCardProps) {
  const [showRawData, setShowRawData] = useState(false)

  const getPlatformColor = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return 'bg-pink-100 text-pink-700'
      case 'twitter':
        return 'bg-blue-100 text-blue-700'
      case 'youtube':
        return 'bg-red-100 text-red-700'
      case 'linkedin':
        return 'bg-indigo-100 text-indigo-700'
      case 'tiktok':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getEngagementColor = (rate?: number) => {
    if (!rate) return 'text-slate-400'
    if (rate > 0.05) return 'text-green-600'
    if (rate > 0.02) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getContactScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const isEnriched = contact.bio || contact.location || contact.contact_score || contact.follower_count

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {contact.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-2xl">{contact.name || 'Unknown Contact'}</CardTitle>
                {isEnriched ? (
                  <CheckCircle className="w-5 h-5 text-green-600" title="Enriched Profile" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-400" title="Basic Profile" />
                )}
                <SyncStatusIndicator contactId={contact.id} />
                {contact.contact_score !== undefined && (
                  <ConfidenceBadge value={contact.contact_score} />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {contact.platform && (
                  <Badge className={getPlatformColor(contact.platform)} variant="secondary">
                    {contact.platform}
                  </Badge>
                )}
                {contact.username && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-slate-600 font-mono">@{contact.username}</span>
                    {contact.confidence_username !== undefined && (
                      <FieldConfidenceBadge 
                        field="username" 
                        value={contact.confidence_username} 
                        showField={false}
                      />
                    )}
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-slate-600">{contact.email}</span>
                    {contact.confidence_email !== undefined && (
                      <FieldConfidenceBadge 
                        field="email" 
                        value={contact.confidence_email} 
                        showField={false}
                      />
                    )}
                  </div>
                )}
              </div>

              {contact.bio && (
                <CardDescription className="max-w-2xl group flex items-start">
                  <span className="flex-1">{contact.bio}</span>
                  {contact.confidence_bio !== undefined && (
                    <FieldConfidenceBadge 
                      field="bio" 
                      value={contact.confidence_bio} 
                      showField={false}
                      showValue={false}
                    />
                  )}
                </CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Raw Data
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View Raw Data
                </>
              )}
            </Button>
            {contact.username && contact.platform && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://${contact.platform}.com/${contact.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contact.follower_count && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Followers</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {contact.follower_count.toLocaleString()}
              </div>
            </div>
          )}

          {contact.engagement_rate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Engagement</span>
              </div>
              <div className={`text-2xl font-bold ${getEngagementColor(contact.engagement_rate)}`}>
                {(contact.engagement_rate * 100).toFixed(1)}%
              </div>
            </div>
          )}

          {contact.contact_score && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Confidence</span>
              </div>
              <div className={`text-2xl font-bold ${getContactScoreColor(contact.contact_score)}`}>
                {(contact.contact_score * 100).toFixed(0)}%
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Added</span>
            </div>
            <div className="text-sm text-slate-700">
              {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Location with confidence */}
        {contact.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{contact.location}</span>
            {contact.confidence_location !== undefined && (
              <FieldConfidenceBadge 
                field="location" 
                value={contact.confidence_location} 
                showField={false}
              />
            )}
          </div>
        )}

        {/* Phone with confidence */}
        {contact.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{contact.phone}</span>
            {contact.confidence_phone !== undefined && (
              <FieldConfidenceBadge 
                field="phone" 
                value={contact.confidence_phone} 
                showField={false}
              />
            )}
          </div>
        )}

        {/* Tags */}
        <ContactTagManager contact={contact} onUpdate={onContactUpdate} />

        {/* Raw Data Toggle */}
        {showRawData && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Raw Profile Data</h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(contact, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Phone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}