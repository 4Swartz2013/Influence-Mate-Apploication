import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { getConfidenceBadgeColor } from "@/lib/confidence/compute";

interface ConfidenceBadgeProps {
  value: number;
  showValue?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBadge({ 
  value, 
  showValue = false, 
  showLabel = true,
  size = 'sm' 
}: ConfidenceBadgeProps) {
  // Determine badge label
  const label = value >= 0.9 ? "High" : value >= 0.7 ? "Moderate" : "Low";
  
  // Get color class
  const colorClass = getConfidenceBadgeColor(value);
  
  // Size classes
  const sizeClass = size === 'sm' ? 'text-xs py-0 px-1.5' : 
                    size === 'md' ? 'text-sm' : 
                    'text-base px-3 py-1';
  
  // Format display value as percentage
  const displayValue = `${Math.round(value * 100)}%`;

  const content = (
    <div className="flex items-center space-x-1">
      {showValue && <span>{displayValue}</span>}
      {showLabel && <span>{label}</span>}
      {!showValue && !showLabel && <span>{displayValue}</span>}
    </div>
  );
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary"
            className={`${colorClass} ${sizeClass}`}
          >
            {content}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">Confidence Score: {displayValue}</p>
            <p>Level: {label}</p>
            <p className="text-slate-500">
              Based on validation checks and data quality
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}