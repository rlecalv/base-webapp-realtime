import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4" />
            <span>EstimerMonImmeuble.fr</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <Link href="/estimation" className="hover:text-foreground transition-colors">Estimer</Link>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground/70">
          Estimation indicative basee sur les transactions DVF et donnees BDNB. Ne constitue pas une expertise immobiliere.
        </p>
      </div>
    </footer>
  );
}
