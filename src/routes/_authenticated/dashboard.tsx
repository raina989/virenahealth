import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Leaf, LogOut, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MacroTable } from "@/components/virena/MacroTable";
import { GlucoseCurve } from "@/components/virena/GlucoseCurve";
import { PlateBuilder } from "@/components/virena/PlateBuilder";
import { PcosPanel } from "@/components/virena/PcosPanel";
import {
  SWAPS,
  evaluateGuardrail,
  getIngredient,
  isHighGI,
  totalMacros,
  type PlateItem,
} from "@/lib/nutrition";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Virena dashboard" },
      {
        name: "description",
        content: "Build your plate, track live macros, and watch your estimated glucose curve respond.",
      },
      { property: "og:title", content: "Your Virena dashboard" },
      { property: "og:description", content: "Live macros, glucose curves and PCOS tracking in one calm view." },
    ],
  }),
  component: Dashboard;
});

function Dashboard() {
  return null;
}
