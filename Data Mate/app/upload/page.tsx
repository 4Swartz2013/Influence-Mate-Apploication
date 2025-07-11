'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { transformPipeline, parseCSVToContacts, processBulkContacts } from '@/lib/transformer'
import { 
  Upload, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface UploadResult {
  total: number
  successful: number
  failed: number
  duplicates: number
  results: any[]
}

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setUploading(true)
      setProgress(0)
      setUploadResult(null)

      const content = await file.text()
      const contacts = parseCSVToContacts(content)

      if (contacts.length === 0) {
        toast.error('No valid contacts found in CSV file')
        return
      }

      toast.success(`Found ${contacts.length} contacts in CSV file`)

      // Process contacts in batches
      const batchSize = 10
      const results = []
      let successful = 0
      let failed = 0
      let duplicates = 0

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize)
        const batchResults = await processBulkContacts(batch, user.id, 'uploaded_csv')
        
        batchResults.forEach(result => {
          if (result.success) {
            if (result.is_duplicate) {
              duplicates++
            } else {
              successful++
            }
          } else {
            failed++
          }
        })

        results.push(...batchResults)
        setProgress(Math.round(((i + batch.length) / contacts.length) * 100))
      }

      setUploadResult({
        total: contacts.length,
        successful,
        failed,
        duplicates,
        results
      })

      toast.success(`Upload complete: ${successful} new, ${duplicates} merged, ${failed} failed`)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process upload')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleManualEntry = async (formData: FormData) => {
    if (!user) return

    try {
      setUploading(true)

      const rawInput = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        username: formData.get('username') as string,
        platform: formData.get('platform') as string,
        bio: formData.get('bio') as string,
        location: formData.get('location') as string,
        user_id: user.id,
        external_source: 'manual_entry',
        raw_record: Object.fromEntries(formData.entries())
      }

      const result = await transformPipeline(rawInput)

      if (result.success) {
        toast.success(result.is_duplicate ? 'Contact merged with existing record' : 'Contact added successfully')
        setUploadResult({
          total: 1,
          successful: result.is_duplicate ? 0 : 1,
          failed: 0,
          duplicates: result.is_duplicate ? 1 : 0,
          results: [result]
        })
      } else {
        toast.error('Failed to add contact: ' + (result.errors?.[0] || 'Unknown error'))
      }

    } catch (error) {
      console.error('Manual entry error:', error)
      toast.error('Failed to add contact')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upload Contacts</h1>
          <p className="text-slate-600">
            Import contacts from CSV files or add them manually with automatic cleaning and deduplication
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSV Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>CSV Upload</span>
              </CardTitle>
              <CardDescription>
                Upload a CSV file with contact information. Fields will be automatically mapped and cleaned.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">
                    Choose a CSV file to upload
                  </p>
                  <p className="text-xs text-slate-500">
                    Supports name, email, username, platform, bio, location, and more
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-4"
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing contacts...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Manual Entry</span>
              </CardTitle>
              <CardDescription>
                Add a single contact manually with automatic field validation and cleaning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleManualEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" placeholder="@johndoe" />
                  </div>
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Input id="platform" name="platform" placeholder="instagram" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" placeholder="Contact bio or description..." />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="New York, NY" />
                </div>
                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Contact...
                    </>
                  ) : (
                    'Add Contact'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Upload Results */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Upload Results</span>
              </CardTitle>
              <CardDescription>
                Summary of the contact import process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{uploadResult.total}</div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">New</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">{uploadResult.successful}</div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Merged</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">{uploadResult.duplicates}</div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Failed</span>
                  </div>
                  <div className="text-2xl font-bold text-red-700">{uploadResult.failed}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-900">Processing Details</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {uploadResult.results.slice(0, 10).map((result, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                      <span className="truncate">
                        Contact {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          result.is_duplicate ? (
                            <Badge variant="outline" className="text-yellow-700">Merged</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-700">Added</Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-red-700">Failed</Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {Math.round((result.confidence_scores?.overall || 0) * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                  {uploadResult.results.length > 10 && (
                    <p className="text-xs text-slate-500 text-center">
                      ... and {uploadResult.results.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  )
}