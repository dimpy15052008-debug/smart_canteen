/**
 * AuthButton.tsx — Premium cursor-driven submit button.
 * Replaces the previous AuthButton with full pointer interaction system.
 * Auth logic / form semantics are UNTOUCHED.
 */
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { motion, AnimatePresence, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { UserRole } from "../../types";
import { ROLE_THEMES } from "../motion/tokens";
import { ROLE_PERSONALITIES } from "../motion/rolePersonalities";
import { useButtonPointer } from "../motion/useButtonPointer";
import { RippleEffect, type RippleData } from "./Ripple";
import { ParticleBurst } from "./ParticleBurst";
import { AuthCursorContext, type AuthCursorState } from "./AuthCursorContext";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  role: UserRole;
  isSubmitting?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  formValid?: boolean;
}

let rippleIdCounter = 0;

// ─── Scan line for Admin ──────────────────────────────────────────────────────
const ScanLine: React.FC<{ color: string; trigger: number }> = ({
  color,
  trigger,
}) => {
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (trigger > 0) setKey((k) => k + 1);
  }, [trigger]);
  if (trigger === 0) return null;
  return (
    <span
      key={key}
      aria-hidden="true"
      className="absolute inset-x-0 pointer-events-none"
      style={{
        top: "50%",
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${color}cc, transparent)`,
        animation: "scan-line 600ms cubic-bezier(0.4,0,0.2,1) forwards",
      }}
    />
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  role,
  isSubmitting = false,
  isSuccess = false,
  isError = false,
  formValid = false,
  disabled,
  className = "",
  onClick,
  ...props
}) => {
  const theme = ROLE_THEMES[role];
  const personality = ROLE_PERSONALITIES[role];
  const cursorCtx = useContext(AuthCursorContext);

  // ── External state for the pointer hook ───────────────────────────────────
  const externalState =
    disabled
      ? ("disabled" as const)
      : isSubmitting
      ? ("submitting" as const)
      : isSuccess
      ? ("success" as const)
      : isError
      ? ("error" as const)
      : null;

  const {
    magnetX,
    magnetY,
    tiltX,
    tiltY,
    state: pointerState,
    isCoarse,
    reducedMotion,
    buttonRef,
    zoneRef,
    zoneHandlers,
    buttonHandlers,
    pointerNX,
    pointerNY,
  } = useButtonPointer(role, externalState);

  // ── Ripples ────────────────────────────────────────────────────────────────
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ── Particle dimensions ────────────────────────────────────────────────────
  const [btnSize, setBtnSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!buttonRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBtnSize({ w: width, h: height });
    });
    ro.observe(buttonRef.current);
    return () => ro.disconnect();
  }, [buttonRef]);

  // ── Scan line trigger (Admin hover-enter) ─────────────────────────────────
  const [scanTrigger, setScanTrigger] = useState(0);
  const prevStateRef = useRef(pointerState);
  useEffect(() => {
    if (
      personality.hasScanLine &&
      pointerState === "hover" &&
      prevStateRef.current !== "hover"
    ) {
      setScanTrigger((n) => n + 1);
    }
    prevStateRef.current = pointerState;
  }, [pointerState, personality.hasScanLine]);

  // ── Spotlight opacity ─────────────────────────────────────────────────────
  const isHovered = pointerState === "hover" || pointerState === "pressed";
  const spotlightOpacity = isSubmitting ? 0.3 : isHovered ? 1 : 0;
  const spotlightRadius = pointerState === "pressed" ? 90 : 140;
  const edgeStop = 60 + personality.spotlightEdge * 20;

  // ── Label parallax (1.4× body drift) ──────────────────────────────────────
  const labelX = useTransform(magnetX, (v) => v * 0.4);
  const labelY = useTransform(magnetY, (v) => v * 0.4);

  // ── Arrow animation ───────────────────────────────────────────────────────
  const arrowX = isHovered && !isCoarse && !reducedMotion ? 4 : 0;
  const arrowStretch = pointerState === "pressed" ? 1.3 : 1;

  // ── Click handler — spawn ripple ──────────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isSubmitting || isSuccess) return;
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple: RippleData = {
          id: rippleIdCounter++,
          x,
          y,
          color: theme.accent,
          style: personality.rippleStyle,
        };
        setRipples((prev) => {
          const limited = prev.slice(-3); // keep last 3 max
          return [...limited, newRipple];
        });
      }
      onClick?.(e);
    },
    [
      disabled,
      isSubmitting,
      isSuccess,
      buttonRef,
      onClick,
      theme.accent,
      personality.rippleStyle,
    ]
  );

  // ── Cursor context updates ─────────────────────────────────────────────────
  useEffect(() => {
    if (isCoarse || !cursorCtx) return;
    let cs: AuthCursorState;
    if (isSubmitting) {
      cs = "loading";
    } else if (pointerState === "pressed") {
      cs = "pressed";
    } else if (isHovered) {
      cs = "hover";
    } else {
      cs = "idle";
    }
    cursorCtx.setCursorState(cs);
  }, [pointerState, isSubmitting, isHovered, isCoarse, cursorCtx]);

  // ── Error shake ────────────────────────────────────────────────────────────
  const shakeAnimation =
    isError && !reducedMotion
      ? { x: [-6, 6, -4, 4, -2, 2, 0] }
      : undefined;

  // ── Idle ready pulse ───────────────────────────────────────────────────────
  const showIdlePulse =
    formValid && pointerState === "idle" && !isSubmitting && !isError && !reducedMotion;

  // ── Gradient ───────────────────────────────────────────────────────────────
  const gradient = isError
    ? "linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)"
    : isSuccess
    ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
    : `linear-gradient(90deg, ${theme.accent} 0%, ${theme.accent2} 100%)`;

  const boxShadow = isError
    ? "0 0 25px rgba(244,63,94,0.45)"
    : isSuccess
    ? "0 0 25px rgba(16,185,129,0.45)"
    : isHovered && !reducedMotion
    ? `0 8px 32px -4px ${theme.glow}, 0 0 0 1px ${theme.accent}44`
    : `0 4px 20px -2px ${theme.glow}`;

  const isDisabled = Boolean(disabled) || isSubmitting || isSuccess;

  return (
    // ── Magnetic zone wrapper (larger hit area for zone detection) ───────────
    <div
      ref={zoneRef as React.RefObject<HTMLDivElement>}
      className="relative py-12 -my-12 px-12 -mx-12"
      onPointerMove={isCoarse || reducedMotion ? undefined : zoneHandlers.onPointerMove}
      onPointerLeave={isCoarse || reducedMotion ? undefined : zoneHandlers.onPointerLeave}
      style={{ zIndex: 10 }}
      aria-hidden="false"
    >
      {/* ── Idle ready pulse glow ─────────────────────────────── */}
      {showIdlePulse && (
        <div
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 40% at 50% 100%, ${theme.glow}, transparent)`,
            animation: "ready-pulse 5s ease-in-out infinite",
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      {/* ── The actual button ──────────────────────────────────────────────── */}
      <motion.button
        ref={buttonRef}
        type={(props.type as "submit" | "button" | "reset") ?? "submit"}
        disabled={isDisabled}
        onClick={handleClick}
        aria-busy={isSubmitting}
        aria-live="polite"
        // Pointer handlers
        onPointerEnter={buttonHandlers.onPointerEnter}
        onPointerMove={buttonHandlers.onPointerMove}
        onPointerLeave={buttonHandlers.onPointerLeave}
        onPointerDown={buttonHandlers.onPointerDown}
        onPointerUp={buttonHandlers.onPointerUp}
        onPointerCancel={buttonHandlers.onPointerCancel}
        // Framer-motion animate + transition
        animate={
          shakeAnimation
            ? shakeAnimation
            : pointerState === "pressed" && !reducedMotion
            ? { scale: 0.97 }
            : isHovered && !reducedMotion
            ? { scale: 1.02 }
            : { scale: 1 }
        }
        transition={
          shakeAnimation
            ? { duration: 0.28 }
            : { type: "spring", stiffness: 300, damping: 22 }
        }
        className={[
          "relative w-full py-3.5 px-5 rounded-xl text-white font-semibold",
          "text-xs sm:text-sm flex items-center justify-center gap-2",
          "overflow-hidden select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "transition-[box-shadow] duration-300",
          className,
        ].join(" ")}
        // Single combined style object
        style={{
          x: reducedMotion || isCoarse ? 0 : magnetX,
          y: reducedMotion || isCoarse ? 0 : magnetY,
          rotateX: reducedMotion || isCoarse ? 0 : tiltX,
          rotateY: reducedMotion || isCoarse ? 0 : tiltY,
          perspective: "800px",
          background: gradient,
          boxShadow,
          willChange: isHovered ? "transform" : "auto",
          "--tw-ring-color": theme.accent,
        } as React.CSSProperties}
        {...(props as any)}
      >
        {/* ── Cursor spotlight (radial, follows --mx/--my) ──────────── */}
        {!reducedMotion && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-150"
            style={{
              opacity: spotlightOpacity,
              background: `radial-gradient(${spotlightRadius}px circle at var(--mx, 50%) var(--my, 50%), ${theme.accent}55, transparent ${edgeStop}%)`,
              mixBlendMode: "soft-light",
              zIndex: 1,
            }}
          />
        )}

        {/* ── Border light tracking ─────────────────────────────────── */}
        {!reducedMotion && isHovered && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(80px circle at var(--mx, 50%) var(--my, 50%), ${theme.accent}cc, transparent 100%)`,
              WebkitMask:
                "linear-gradient(#fff,#fff) content-box, linear-gradient(#fff,#fff)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff,#fff) content-box, linear-gradient(#fff,#fff)",
              maskComposite: "exclude",
              padding: "1px",
              zIndex: 1,
            }}
          />
        )}

        {/* ── Submitting state border chase ─────────────────────────── */}
        {isSubmitting && !reducedMotion && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `conic-gradient(from var(--conic-angle, 0deg), ${theme.accent}, ${theme.accent2}, ${theme.accent})`,
              WebkitMask:
                "linear-gradient(#fff,#fff) content-box, linear-gradient(#fff,#fff)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#fff,#fff) content-box, linear-gradient(#fff,#fff)",
              maskComposite: "exclude",
              padding: "1.5px",
              animation: "conic-spin 1.5s linear infinite",
              zIndex: 1,
            }}
          />
        )}

        {/* ── Periodic shine sweep ──────────────────────────────────── */}
        {!reducedMotion && !isDisabled && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none -translate-x-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
              animation: "button-shine 6s ease-in-out infinite",
              zIndex: 1,
            }}
          />
        )}

        {/* ── Admin scan line ───────────────────────────────────────── */}
        {personality.hasScanLine && (
          <ScanLine color={theme.accent} trigger={scanTrigger} />
        )}

        {/* ── Particles (Student sparkle / Canteen ember) ───────────── */}
        {personality.particles.kind !== "none" &&
          isHovered &&
          !reducedMotion &&
          btnSize.w > 0 && (
            <ParticleBurst
              kind={personality.particles.kind}
              maxAlive={personality.particles.maxAlive}
              lifespanMs={personality.particles.lifespanMs}
              color={theme.accent}
              pointerX={pointerNX.get()}
              pointerY={pointerNY.get()}
              active={isHovered}
              width={btnSize.w}
              height={btnSize.h}
            />
          )}

        {/* ── Ripples ───────────────────────────────────────────────── */}
        {ripples.map((r) => (
          <RippleEffect key={r.id} ripple={r} onDone={removeRipple} />
        ))}

        {/* ── Button label / states ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative z-10 flex items-center gap-2"
              style={{ x: labelX, y: labelY }}
            >
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 flex items-center gap-2 text-white"
              style={{ x: labelX, y: labelY }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
              </motion.div>
              <span>Verified</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex items-center gap-2"
              style={{ x: labelX, y: labelY }}
            >
              <span>{label}</span>
              <motion.div
                animate={
                  isSubmitting
                    ? { x: [0, 24], opacity: [1, 0] }
                    : !reducedMotion
                    ? { x: arrowX, scaleX: arrowStretch }
                    : {}
                }
                transition={
                  isSubmitting
                    ? { duration: 0.35, ease: [0.4, 0, 1, 1] }
                    : { type: "spring", stiffness: 300, damping: 22 }
                }
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
