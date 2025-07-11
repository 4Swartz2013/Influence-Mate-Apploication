import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export function ConfidenceLegend() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Confidence Scores Explained</span>
        </CardTitle>
        <CardDescription>
          How we calculate data quality and reliability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Confidence Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-700">High</Badge>
                <span className="text-sm text-green-700">90-100%</span>
                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
              </div>
              <Progress value={95} className="h-1.5 mt-2" indicatorClassName="bg-green-500" />
              <p className="text-xs text-green-800 mt-2">
                Verified from multiple sources or passed strict validation
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-700">Moderate</Badge>
                <span className="text-sm text-yellow-700">70-89%</span>
                <Star className="w-4 h-4 text-yellow-600 ml-auto" />
              </div>
              <Progress value={80} className="h-1.5 mt-2" indicatorClassName="bg-yellow-500" />
              <p className="text-xs text-yellow-800 mt-2">
                Passed basic validation but may need additional verification
              </p>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-700">Low</Badge>
                <span className="text-sm text-red-700">0-69%</span>
                <AlertTriangle className="w-4 h-4 text-red-600 ml-auto" />
              </div>
              <Progress value={45} className="h-1.5 mt-2" indicatorClassName="bg-red-500" />
              <p className="text-xs text-red-800 mt-2">
                Failed validation or needs immediate verification
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">What Affects Confidence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">Email Confidence</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1">
                <li>Valid email format</li>
                <li>Domain with valid MX records</li>
                <li>Not a disposable email domain</li>
                <li>Business vs. personal email address</li>
              </ul>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">Location Confidence</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1">
                <li>Geocoding verification success</li>
                <li>Format (City, State/Country)</li>
                <li>Match against known locations</li>
              </ul>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">Phone Confidence</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1">
                <li>Valid number format for region</li>
                <li>Proper country code</li>
                <li>Not a test/bogus pattern (555-...)</li>
              </ul>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-700">Name Confidence</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 pl-1">
                <li>Full name (first + last)</li>
                <li>Proper capitalization</li>
                <li>No numbers or special characters</li>
                <li>Not a placeholder (e.g., "John Doe")</li>
              </ul>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 border-t pt-2">
          Low confidence scores trigger automatic re-enrichment to improve data quality.
          Hover over any confidence badge to see details.
        </p>
      </CardContent>
    </Card>
  );
}