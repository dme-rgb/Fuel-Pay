import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Fuel, User } from "lucide-react";
import clsx from "clsx";

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isHome = location === "/";
  const isAdmin = location.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Container - constrained width for mobile feel on desktop */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl flex flex-col relative overflow-hidden">

        {/* Navbar */}
        {showNav && (
          <nav className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
            <Link href={isAdmin ? "/admin" : "/"}>
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg transition-transform group-hover:scale-105">
                  <Fuel className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-primary">
                  FuelPay
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              ) : (
                !isAdmin && (
                  <Link href="/auth">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                )
              )}
            </div>
          </nav>
        )}

        {/* Content */}
        <main className={clsx("flex-1 p-6 relative", !showNav && "pt-6")}>
          {/* Background decorative blobs */}
          <div className="absolute top-0 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/40 flex justify-center gap-6">
          <Link href="/contact" className="hover:text-primary transition-colors hover:underline">
            Contact Us
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors hover:underline">
            T&C and Policies
          </Link>
        </footer>
      </div>
    </div>
  );
}
