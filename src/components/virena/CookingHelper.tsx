import { useRef, useState } from "react";
import { Send, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeDish, generateResponse, plateItemsFromAdvice, type ChatMessage } from "@/lib/cooking-helper";
import { type PlateItem } from "@/lib/nutrition";

type Props = {
  pcosMode: boolean;
  goal: string | null;
  phaseId: string | null;
  onSyncToPlate: (items: PlateItem[]) => void;
};

const SUGGESTIONS = [
  "Alfredo chicken pasta with green tea",
  "Butter chicken with naan",
  "Fried rice with egg",
  "Grilled cheese sandwich",
  "Smoothie bowl with granola",
  "Burger and fries",
];

export function CookingHelper({ pcosMode, goal, phaseId, onSyncToPlate }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [lastAdvicePlate, setLastAdvicePlate] = useState<PlateItem[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const advice = analyzeDish(trimmed, { pcosMode, goal, phaseId });
    const responseText = generateResponse(advice);
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: responseText,
      plateSync: advice.healthyPlate,
    };
    const plateItems = plateItemsFromAdvice(advice);

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLastAdvicePlate(plateItems);
    setInput("");
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  return (
    <section className="surface flex flex-col p-6" aria-label="AI cooking helper" style={{ minHeight: "420px" }}>
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="h-5 w-5 text-clay" aria-hidden />
        <h2 className="font-display text-xl">Cooking helper</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell me what you're cooking — I'll check it against your goals and build a healthier plate.
      </p>

      <div ref={scrollRef} className="mt-4 flex-1 space-y-3 overflow-y-auto" style={{ maxHeight: "260px" }}>
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-6 text-center">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-clay" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Try: "alfredo chicken pasta" or "butter chicken with naan" — I'll suggest a healthier version.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      {lastAdvicePlate && lastAdvicePlate.length > 0 ? (
        <Button
          className="mt-3 w-full gap-2"
          onClick={() => {
            onSyncToPlate(lastAdvicePlate);
            setLastAdvicePlate(null);
          }}
        >
          <Sparkles className="h-4 w-4" /> Log healthy recipe to plate
        </Button>
      ) : null}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are you cooking?"
          className="flex-1 bg-background"
          aria-label="Describe your meal"
        />
        <Button type="submit" size="icon" aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
