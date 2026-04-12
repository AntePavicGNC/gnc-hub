import { Sparkles } from "lucide-react";

export function ComingSoon({
  title,
  description,
  slice,
}: {
  title: string;
  description: string;
  slice?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-accent p-3 text-muted-foreground">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {slice && (
        <p className="mt-4 text-xs font-medium text-muted-foreground/70">
          Wird gebaut in {slice}
        </p>
      )}
    </div>
  );
}
