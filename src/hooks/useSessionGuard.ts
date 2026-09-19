import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const INACTIVITY_MS = 30 * 60 * 1000;
const SESSION_KEY = "virena-session-id";

function sessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Signs out after inactivity and when the same account signs in elsewhere. */
export function useSessionGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let lastActive = Date.now();
    const mine = sessionId();

    async function bail(message: string) {
      if (cancelled) return;
      cancelled = true;
      await supabase.auth.signOut();
      toast.message(message);
      void navigate({ to: "/", replace: true });
    }

    function touch() {
      lastActive = Date.now();
    }

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, touch, { passive: true });

    async function claim() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase
        .from("active_sessions")
        .upsert(
          { user_id: data.user.id, session_id: mine, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
    }

    async function check() {
      if (Date.now() - lastActive > INACTIVITY_MS) {
        await bail("Signed out after 30 minutes of inactivity.");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: row } = await supabase
        .from("active_sessions")
        .select("session_id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (row && row.session_id !== mine) {
        await bail("Your account was signed in on another browser.");
      }
    }

    void claim();
    const timer = window.setInterval(() => void check(), 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      for (const e of events) window.removeEventListener(e, touch);
    };
  }, [navigate]);
}
