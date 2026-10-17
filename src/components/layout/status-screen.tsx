import { House, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pages } from "@/configs/paths/pages.path";

export function StatusScreen({
  code,
  title,
  description,
  onRetry,
}: {
  code: string;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-extrabold tracking-[0.1em] text-[var(--terra-moss)] uppercase">
          {code}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-foreground">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-center gap-2">
          {onRetry && (
            <Button className="h-11" onClick={onRetry}>
              <RefreshCw />
              Попробовать снова
            </Button>
          )}
          <Link href={pages.ROOT}>
            <Button variant="outline" className="h-11">
              <House />
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
