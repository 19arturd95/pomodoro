import {
  Action,
  ActionPanel,
  Form,
  List,
  Toast,
  showToast,
  showHUD,
  closeMainWindow,
  Icon,
} from "@raycast/api";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Type describing the current phase of the Pomodoro cycle.
 */
type Phase = "focus" | "break" | "done";

/**
 * Main command component. When not started, it displays a form to configure the timer.
 * Once started, it shows a list item with the current status and actions.
 */
export default function Command() {
  const [started, setStarted] = useState(false);
  const [focusMin, setFocusMin] = useState<number>(25);
  const [breakMin, setBreakMin] = useState<number>(5);
  const [rounds, setRounds] = useState<number>(4);

  // Internal timer state
  const [phase, setPhase] = useState<Phase>("focus");
  const [round, setRound] = useState(1);
  const [endTs, setEndTs] = useState<number | null>(null);
  const ticker = useRef<NodeJS.Timeout | null>(null);

  // Compute remaining seconds on each render
  const remaining = useMemo(() => {
    if (!endTs) return 0;
    const ms = Math.max(0, endTs - Date.now());
    return Math.ceil(ms / 1000);
  }, [endTs]);

  // Format remaining time as mm:ss
  const mmss = useMemo(() => {
    const minutes = Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(remaining % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remaining]);

  /**
   * Start a phase (focus or break). Sets the new end timestamp and shows a toast.
   */
  function startPhase(next: Phase, nextRound: number = round) {
    const minutes = next === "focus" ? focusMin : breakMin;
    setPhase(next);
    setRound(nextRound);
    setEndTs(Date.now() + minutes * 60 * 1000);
    showToast({
      style: Toast.Style.Animated,
      title: next === "focus" ? `Focus #${nextRound}` : "Przerwa",
      message: `${minutes} min`,
    });
  }

  /**
   * Stop the timer and reset internal state.
   */
  function stopAll() {
    if (ticker.current) clearInterval(ticker.current);
    setStarted(false);
    setEndTs(null);
    showToast({ style: Toast.Style.Failure, title: "Zatrzymano Pomodoro" });
  }

  // Manage the ticking effect: check every second if the current phase is over
  useEffect(() => {
    if (!started) return;
    ticker.current = setInterval(() => {
      if (endTs && Date.now() >= endTs) {
        // Current phase completed
        if (phase === "focus") {
          showHUD("✅ Koniec focusu — czas na przerwę");
          startPhase("break", round);
        } else if (phase === "break") {
          if (round < rounds) {
            showHUD(`🔁 Runda ${round + 1} z ${rounds}`);
            startPhase("focus", round + 1);
          } else {
            setPhase("done");
            setEndTs(null);
            showToast({ style: Toast.Style.Success, title: "🎉 Zrobione!" });
          }
        }
      }
    }, 1000);
    return () => {
      if (ticker.current) clearInterval(ticker.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, endTs, phase, round, rounds, focusMin, breakMin]);

  // Initial form to configure the timer
  if (!started) {
    return (
      <Form
        actions={
          <ActionPanel>
            <Action
              title="Start Pomodoro"
              icon={Icon.Play}
              onAction={async () => {
                setStarted(true);
                await closeMainWindow({ clearRootSearch: false });
                startPhase("focus", 1);
              }}
            />
          </ActionPanel>
        }
      >
        <Form.Description text="Ustaw czasy i rozpocznij sesję (okno Raycast może zostać zamknięte – HUD/Toast poinformują o zmianach faz)." />
        <Form.Separator />
        <Form.TextField
          id="focus"
          title="Focus (min)"
          value={String(focusMin)}
          onChange={(v) => setFocusMin(Math.max(1, Number(v) || 25))}
        />
        <Form.TextField
          id="break"
          title="Przerwa (min)"
          value={String(breakMin)}
          onChange={(v) => setBreakMin(Math.max(1, Number(v) || 5))}
        />
        <Form.TextField
          id="rounds"
          title="Rundy"
          value={String(rounds)}
          onChange={(v) => setRounds(Math.max(1, Number(v) || 4))}
        />
      </Form>
    );
  }

  // Status view when the timer is running
  return (
    <List searchBarPlaceholder="Pomodoro w toku…">
      <List.Item
        title={
          phase === "focus"
            ? "Focus"
            : phase === "break"
            ? "Przerwa"
            : "Zakończone"
        }
        subtitle={phase === "done" ? "🎉" : `Runda ${round}/${rounds}`}
        accessories={phase === "done" ? [] : [{ text: mmss }]}
        actions={
          <ActionPanel>
            <Action title="Stop" icon={Icon.Stop} onAction={stopAll} />
            <Action
              title="Reset"
              icon={Icon.Repeat}
              onAction={() => {
                stopAll();
                setRound(1);
                setPhase("focus");
              }}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}