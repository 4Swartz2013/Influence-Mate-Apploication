import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBar } from "./ConfidenceBar";
import { FieldConfidenceBadge } from "./FieldConfidenceBadge";
import { ConfidenceLegend } from "./ConfidenceLegend";
import { 
  getConfidenceBadgeColor, 
  getContactConfidence 
} from "@/lib/confidence/compute";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ContactConfidence } from "@/lib/confidence/types";
import { 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Mail, 
  MapPin, 
  FileText, 
  Phone, 
  AtSign, 
  User 
} from "lucide-react";

interface ContactConfidencePanelProps {
  contactId: string;
  showLegend?: boolean;
}

export function ContactConfidencePanel({ 
  contactId, 
  showLegend = false
}: ContactConfidencePanelProps) {
  const { user } = useAuth();
  const [confidence, setConfidence] = useState<ContactConfidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (user && contactId) {
      fetchConfidence();
    }
  }, [user, contactId]);
  
  const fetchConfidence = async () => {
    setLoading(true);
    const data = await getContactConfidence(contactId);
    setConfidence(data);
    setLoading(false);
  };
  
  const triggerReenrichment = async () => {
    if (!user || !contactId) return;
    
    try {
      setRefreshing(true);
      
      // Create a re-enrichment job
      const { error } = await supabase
        .from('enrichment_jobs')
        .insert({
          user_id: user.id,
          job_type: 'confidence_reenrichment',
          status: 'pending',
          target_table: 'contacts',
          target_id: contactId,
          parameters: {
            trigger: 'manual',
            priority: 'high'
          },
          progress: 0
        });
        
      if (error) throw error;
      
      // Wait a bit and then refresh the confidence data
      setTimeout(fetchConfidence, 1000);
    } catch (error) {
      console.error('Error triggering re-enrichment:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-32 h-6 bg-slate-200 animate-pulse rounded" />
          </CardTitle>
          <CardDescription>
            <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full h-10 bg-slate-200 animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-200 animate-pulse rounded" />
              <div className="h-12 bg-slate-200 animate-pulse rounded" />
              <div className="h-12 bg-slate-200 animate-pulse rounded" />
              <div className="h-12 bg-slate-200 animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!confidence) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Confidence Scores</span>
          </CardTitle>
          <CardDescription>
            No confidence data available for this contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Button onClick={triggerReenrichment} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Calculate Confidence Scores
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine overall confidence level text and icon
  let overallIcon = <CheckCircle className="w-5 h-5 text-green-600" />;
  let overallText = "High Confidence Data";
  
  if (confidence.overall.value < 0.7) {
    overallIcon = <AlertTriangle className="w-5 h-5 text-red-600" />;
    overallText = "Low Confidence Data";
  } else if (confidence.overall.value < 0.9) {
    overallIcon = <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    overallText = "Moderate Confidence Data";
  }
  
  // Determine label color based on overall confidence
  const labelColorClass = getConfidenceBadgeColor(confidence.overall.value);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Confidence Scores</span>
            <Badge className={labelColorClass} variant="secondary">
              {Math.round(confidence.overall.value * 100)}%
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center space-x-2">
            {overallIcon}
            <span>{overallText}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall confidence bar */}
          <div>
            <p className="text-sm font-medium mb-2">Overall Contact Confidence</p>
            <ConfidenceBar value={confidence.overall.value} />
          </div>
          
          {/* Field-specific confidence scores */}
          <div>
            <p className="text-sm font-medium mb-2">Field-Level Confidence</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-2 rounded-md bg-slate-50">
                <Mail className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Address</p>
                  {confidence.email ? (
                    <ConfidenceBar value={confidence.email.value} width="w-32" />
                  ) : (
                    <p className="text-xs text-slate-500">Not available</p>
                  )}
                </div>
                {confidence.email && (
                  <FieldConfidenceBadge field="email" value={confidence.email.value} />
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-md bg-slate-50">
                <User className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Name</p>
                  {confidence.name ? (
                    <ConfidenceBar value={confidence.name.value} width="w-32" />
                  ) : (
                    <p className="text-xs text-slate-500">Not available</p>
                  )}
                </div>
                {confidence.name && (
                  <FieldConfidenceBadge field="name" value={confidence.name.value} />
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-md bg-slate-50">
                <Phone className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone Number</p>
                  {confidence.phone ? (
                    <ConfidenceBar value={confidence.phone.value} width="w-32" />
                  ) : (
                    <p className="text-xs text-slate-500">Not available</p>
                  )}
                </div>
                {confidence.phone && (
                  <FieldConfidenceBadge field="phone" value={confidence.phone.value} />
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-md bg-slate-50">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Location</p>
                  {confidence.location ? (
                    <ConfidenceBar value={confidence.location.value} width="w-32" />
                  ) : (
                    <p className="text-xs text-slate-500">Not available</p>
                  )}
                </div>
                {confidence.location && (
                  <FieldConfidenceBadge field="location" value={confidence.location.value} />
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-md bg-slate-50">
                <AtSign className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Username</p>
                  {confidence.username ? (
                    <ConfidenceBar value={confidence.username.value} width="w-32" />
                  ) : (
                    <p className="text-xs text-slate-500">Not available</p>
                  )}
                </div>
                {confidence.username && (
                  <FieldConfidenceBadge field="username" value={confidence.username.value} />
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-2 rounded-md bg-slate-50">
                <FileText className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Biography</p>
                  {confidence.bio ? (
                    <ConfidenceBar value={confidence.bio.value} width="w-32" />
                  ) : (
                    <p className="text-xs text-slate-500">Not available</p>
                  )}
                </div>
                {confidence.bio && (
                  <FieldConfidenceBadge field="bio" value={confidence.bio.value} />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={triggerReenrichment}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Scores
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showLegend && <ConfidenceLegend />}
    </div>
  );
}