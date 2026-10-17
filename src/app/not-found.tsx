import { House } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pages } from "@/configs/paths/pages.path";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-center">
        <p className="text-xs font-extrabold tracking-[0.1em] text-[var(--terra-moss)] uppercase">
          Ошибка 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-foreground">
          Страница потерялась при переезде.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Похоже, такой страницы не существует — вернитесь на главную.
        </p>
        <Link href={pages.ROOT} className="mt-6 inline-block">
          <Button className="h-11">
            <House />
            На главную
          </Button>
        </Link>
      </div>
    </main>
  );
}
