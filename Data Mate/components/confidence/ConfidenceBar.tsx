import { Progress } from "@/components/ui/progress";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ConfidenceBarProps {
  value: number;
  showValue?: boolean;
  width?: string;
}

export function ConfidenceBar({ 
  value, 
  showValue = true,
  width = 'w-full'
}: ConfidenceBarProps) {
  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value >= 0.9) return 'bg-green-500';
    if (value >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format display value as percentage
  const displayValue = `${Math.round(value * 100)}%`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Progress 
              value={value * 100} 
              className={`h-2 ${width}`}
              indicatorClassName={getColorClass(value)}
            />
            {showValue && (
              <span className="text-xs font-medium">
                {displayValue}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">Confidence Score: {displayValue}</p>
            <p>
              {value >= 0.9 ? "High confidence" : 
               value >= 0.7 ? "Moderate confidence" : 
               "Low confidence"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}