import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader({ subtitle }: { subtitle?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div>
          <span className="font-display text-2xl">Virena</span>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" activeProps={{ className: "bg-secondary" }}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Today
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history" activeProps={{ className: "bg-secondary" }}>
              <CalendarDays className="mr-2 h-4 w-4" /> History
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}
