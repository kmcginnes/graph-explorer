import { ScalarValue } from "@/connector/gremlin/mappers/mapResults";
import { cn } from "@/utils";
import { CalendarIcon, HashIcon, QuoteIcon } from "lucide-react";

function getDisplayValue(scalar: ScalarValue) {
  if (typeof scalar === "string") {
    return scalar;
  } else if (typeof scalar === "number") {
    return new Intl.NumberFormat().format(scalar);
  } else if (scalar instanceof Date) {
    return new Intl.DateTimeFormat().format(scalar);
  }
}

function getIcon(scalar: ScalarValue) {
  if (typeof scalar === "string") {
    return <QuoteIcon className="text-primary-dark size-5" />;
  } else if (typeof scalar === "number") {
    return <HashIcon className="text-primary-dark size-5" />;
  } else if (scalar instanceof Date) {
    return <CalendarIcon className="text-primary-dark size-5" />;
  }
}

export function ScalarSearchResult({ scalar }: { scalar: ScalarValue }) {
  const displayValue = getDisplayValue(scalar);
  const Icon = getIcon(scalar);

  return (
    <div
      className={cn(
        "bg-background-default w-full overflow-hidden transition-all hover:cursor-pointer"
      )}
    >
      <div className="flex w-full flex-row items-center gap-2 p-3 text-left ring-0">
        <div className="flex grow flex-row items-center gap-3">
          <div className="grow text-base font-bold leading-snug">
            {displayValue}
          </div>
          <div>{Icon}</div>
        </div>
      </div>
    </div>
  );
}
