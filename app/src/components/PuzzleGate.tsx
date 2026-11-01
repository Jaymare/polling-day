import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useStoredState } from "../useStoredState";

// The picture is cut into a centre disc and two rings, each turned off by a
// random number of steps. Lining them all up (or giving up) lifts the blur.
// Add ?nogate to the URL to skip it, or ?gate to see it again after passing.

const IMAGE = `${import.meta.env.BASE_URL}maps.png`;
const IMAGE_W = 585;
const IMAGE_H = 417;
// Circle centred on the middle of the map, wide enough to reach the big faces
const CX = 292;
const CY = 208;
const R = 230;
const RADII = [R / 3, (2 * R) / 3, R];
const STEPS = 12;
const STEP_DEG = 360 / STEPS;
const RING_NAMES = ["Centre", "Middle ring", "Outer ring"];
const REVEAL_MS = 1100;

type Phase = "puzzle" | "solved" | "revealing" | "done";

function scrambled() {
  // Never start a ring in the right place
  return RADII.map(() => 1 + Math.floor(Math.random() * (STEPS - 1)));
}

// Turning a ring drags the next ring out the opposite way; the outer ring moves
// alone. Solve from the centre outwards. Every scramble is still solvable,
// since each ring can always be fixed without disturbing the ones inside it.
function link(turned: number, ring: number) {
  if (ring === turned) return 1;
  return ring === turned + 1 ? -1 : 0;
}

// Clip shape for ring i: a disc for the centre, an annulus (via evenodd) otherwise
function ringPath(i: number) {
  const circle = (r: number) =>
    `M ${CX - r} ${CY} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  return i === 0 ? circle(RADII[0]) : circle(RADII[i]) + circle(RADII[i - 1]);
}

export function PuzzleGate({ children }: { children: ReactNode }) {
  const [passed, setPassed] = useStoredState("gate.passed", false);
  // "solved" isn't stored: it follows from the rings all being lined up
  const [stage, setPhase] = useState<Exclude<Phase, "solved">>(() => {
    const params = new URLSearchParams(location.search);
    if (params.has("nogate")) return "done";
    if (params.has("gate")) return "puzzle";
    return passed ? "done" : "puzzle";
  });
  // Steps are unbounded so a ring never spins the long way round from 11 to 0
  const [steps, setSteps] = useState(scrambled);
  const [turns, setTurns] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  // Live angle of the ring being dragged, in degrees from its resting step
  const [drag, setDrag] = useState<{ ring: number; deg: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef(0);

  const solved = steps.every((s) => s % STEPS === 0) && !drag;
  const phase: Phase = stage === "puzzle" && solved ? "solved" : stage;

  useEffect(() => {
    if (phase === "solved") {
      const t = setTimeout(() => setPhase("revealing"), gaveUp ? 1600 : 1400);
      return () => clearTimeout(t);
    }
    if (phase === "revealing") {
      const t = setTimeout(() => {
        setPhase("done");
        setPassed(true);
      }, REVEAL_MS);
      return () => clearTimeout(t);
    }
  }, [phase, gaveUp, setPassed]);

  function turn(ring: number, by: number) {
    if (by === 0) return;
    setSteps((prev) => prev.map((s, i) => s + by * link(ring, i)));
    setTurns((n) => n + 1);
  }

  function giveUp() {
    setGaveUp(true);
    setSteps((prev) => prev.map((s) => Math.round(s / STEPS) * STEPS));
  }

  function pointerAngle(e: PointerEvent) {
    const box = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - (box.left + box.width / 2);
    const y = e.clientY - (box.top + box.height / 2);
    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  function onPointerDown(ring: number, e: PointerEvent) {
    if (phase !== "puzzle") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = pointerAngle(e);
    setDrag({ ring, deg: 0 });
  }

  function onPointerMove(e: PointerEvent) {
    if (!drag) return;
    let deg = pointerAngle(e) - dragStart.current;
    // Crossing the ±180° line shouldn't make the ring jump a full turn
    deg = ((((deg + 180) % 360) + 360) % 360) - 180;
    setDrag({ ring: drag.ring, deg });
  }

  function onPointerUp() {
    if (!drag) return;
    // A tap barely moves the pointer: treat it as one step clockwise
    const by = Math.abs(drag.deg) < 4 ? 1 : Math.round(drag.deg / STEP_DEG);
    setDrag(null);
    turn(drag.ring, by);
  }

  function onKeyDown(ring: number, e: KeyboardEvent) {
    if (phase !== "puzzle") return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") turn(ring, 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") turn(ring, -1);
    else return;
    e.preventDefault();
  }

  if (phase === "done") return <>{children}</>;

  const gated = phase !== "revealing";
  const message = gaveUp
    ? "Fair enough. Here they are."
    : phase === "puzzle"
      ? "Line up the map to get in. Drag or tap a ring to turn it, but watch its neighbour."
      : `Solved in ${turns} turn${turns === 1 ? "" : "s"}. The returning officer is impressed.`;

  return (
    <>
      <div
        className={gated ? "gate-site gate-site--blurred" : "gate-site"}
        inert
      >
        {children}
      </div>
      <div
        className={`gate gate--${phase}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
      >
        <div className="gate__card">
          <h2 id="gate-title" className="gate__title">
            Polling day materials
          </h2>
          <svg
            ref={svgRef}
            className={
              phase === "puzzle"
                ? "gate__rings"
                : "gate__rings gate__rings--solved"
            }
            viewBox={`${CX - R} ${CY - R} ${2 * R} ${2 * R}`}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              {RADII.map((_, i) => (
                <clipPath key={i} id={`gate-clip-${i}`}>
                  <path d={ringPath(i)} clipRule="evenodd" />
                </clipPath>
              ))}
            </defs>
            {RADII.map((_, i) => {
              const pull = drag ? link(drag.ring, i) : 0;
              const dragging = pull !== 0;
              const deg = steps[i] * STEP_DEG + (drag ? drag.deg * pull : 0);
              return (
                <g
                  key={i}
                  className={
                    dragging ? "gate__ring gate__ring--dragging" : "gate__ring"
                  }
                  style={{
                    transform: `rotate(${deg}deg)`,
                    transformOrigin: `${CX}px ${CY}px`,
                  }}
                  clipPath={`url(#gate-clip-${i})`}
                  tabIndex={phase === "puzzle" ? 0 : -1}
                  role="slider"
                  aria-label={RING_NAMES[i]}
                  aria-valuemin={0}
                  aria-valuemax={STEPS - 1}
                  aria-valuenow={((steps[i] % STEPS) + STEPS) % STEPS}
                  onPointerDown={(e) => onPointerDown(i, e)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                >
                  <circle cx={CX} cy={CY} r={R} className="gate__backdrop" />
                  <image href={IMAGE} width={IMAGE_W} height={IMAGE_H} />
                  <path
                    d={ringPath(i)}
                    className="gate__ring-edge"
                    fillRule="evenodd"
                  />
                </g>
              );
            })}
          </svg>
          <p className="gate__message" aria-live="polite">
            {message}
          </p>
          <button
            type="button"
            className="gate__give-up"
            onClick={giveUp}
            disabled={phase !== "puzzle"}
          >
            I give up
          </button>
        </div>
      </div>
    </>
  );
}
