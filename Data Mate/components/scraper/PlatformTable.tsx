'use client'

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Instagram, Twitter, Facebook, TrendingUp, XCircle, AlertCircle } from "lucide-react"

interface PlatformKpi {
  platform: string
  success: number
  failed: number
  queued: number
  in_progress: number
  success_rate: number
  avg_duration_sec: number
}

interface PlatformTableProps {
  data: PlatformKpi[]
  onSelectPlatform?: (platform: string) => void
  selectedPlatform?: string
}

export function PlatformTable({ 
  data, 
  onSelectPlatform,
  selectedPlatform 
}: PlatformTableProps) {
  
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '—';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram_harvester':
        return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'twitter_harvester':
        return <Twitter className="h-4 w-4 text-blue-500" />;
      case 'tiktok_harvester':
        return <div className="h-4 w-4 flex items-center justify-center">
          <span className="text-[10px] font-bold text-black bg-white rounded-full p-0.5">TT</span>
        </div>;
      case 'facebook_harvester':
        return <Facebook className="h-4 w-4 text-blue-700" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  }
  
  const getStatusColor = (successRate: number) => {
    if (successRate >= 90) return 'text-green-500';
    if (successRate >= 75) return 'text-yellow-500';
    return 'text-red-500';
  }
  
  const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram_harvester':
        return 'Instagram';
      case 'twitter_harvester':
        return 'Twitter/X';
      case 'tiktok_harvester':
        return 'TikTok';
      case 'facebook_harvester':
        return 'Facebook';
      default:
        return platform;
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Platform</TableHead>
            <TableHead className="w-[100px]">Success %</TableHead>
            <TableHead className="w-[100px]">Errors</TableHead>
            <TableHead className="w-[100px]">Queued</TableHead>
            <TableHead className="w-[100px]">In Progress</TableHead>
            <TableHead className="w-[150px]">Avg. Duration</TableHead>
            <TableHead className="w-[150px]">Health</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No platform data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((platform) => (
              <TableRow 
                key={platform.platform} 
                className={
                  onSelectPlatform 
                    ? "cursor-pointer hover:bg-slate-50" 
                    : ""
                }
                onClick={() => onSelectPlatform?.(platform.platform)}
                data-selected={selectedPlatform === platform.platform ? "true" : "false"}
                data-state={selectedPlatform === platform.platform ? "selected" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform.platform)}
                    <span>{getPlatformName(platform.platform)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={getStatusColor(platform.success_rate)}>
                    {platform.success_rate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span>{platform.failed}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {platform.queued > 0 ? (
                    <Badge variant="outline">{platform.queued}</Badge>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </TableCell>
                <TableCell>
                  {platform.in_progress > 0 ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {platform.in_progress}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-slate-400" />
                    <span>{formatDuration(platform.avg_duration_sec)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Progress 
                    value={platform.success_rate} 
                    className="h-2"
                    indicatorClassName={
                      platform.success_rate >= 90 
                        ? "bg-green-500" 
                        : platform.success_rate >= 75 
                          ? "bg-yellow-500" 
                          : "bg-red-500"
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}