"use client";

import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ValidationBadgeProps {
  message: string;
}

export function ValidationBadge({ message }: ValidationBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-rose-400 cursor-help">
          <AlertCircle size={13} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-48">
        {message}
      </TooltipContent>
    </Tooltip>
  );
}
