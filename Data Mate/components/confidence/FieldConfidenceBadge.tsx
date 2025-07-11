import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { getConfidenceBadgeColor } from "@/lib/confidence/compute";

interface FieldConfidenceBadgeProps {
  field: string;
  value: number;
  showField?: boolean;
  showValue?: boolean;
}

export function FieldConfidenceBadge({ 
  field, 
  value, 
  showField = false,
  showValue = true 
}: FieldConfidenceBadgeProps) {
  // Format display value as percentage
  const displayValue = `${Math.round(value * 100)}%`;
  
  // Get color class
  const colorClass = getConfidenceBadgeColor(value);
  
  // Get field display name
  const fieldDisplayName = {
    email: "Email",
    location: "Location",
    bio: "Biography",
    phone: "Phone",
    username: "Username",
    name: "Name"
  }[field] || field;
  
  // Get field description
  const fieldDescription = {
    email: "Email address validation and MX check",
    location: "Geocoding verification and format check",
    bio: "Content analysis and spam detection",
    phone: "Phone number format and regional validation",
    username: "Username format and platform consistency",
    name: "Name format validation and completeness"
  }[field] || "Field validation";
  
  // Get field thresholds
  const thresholds = {
    email: 0.5,
    location: 0.4,
    bio: 0.5,
    phone: 0.6,
    name: 0.7,
    username: 0.5
  };
  
  // Determine if below threshold
  const isLow = value < (thresholds[field as keyof typeof thresholds] || 0.5);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary"
            className={`${colorClass} text-xs`}
          >
            <div className="flex items-center space-x-1">
              {showField && <span>{fieldDisplayName}</span>}
              {showValue && <span>{displayValue}</span>}
              {!showField && !showValue && <span>{displayValue}</span>}
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">{fieldDisplayName} Confidence: {displayValue}</p>
            <p>{fieldDescription}</p>
            {isLow && (
              <p className="text-red-500">
                Below threshold - will trigger automatic re-enrichment
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}