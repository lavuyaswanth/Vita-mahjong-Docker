import { useCallback, useEffect, useRef } from 'react';

/**
 * Everything that makes `aria-modal="true"` an honest claim.
 *
 * Declaring `aria-modal` tells assistive tech to hide everything OUTSIDE the
 * dialog from the virtual cursor. If real keyboard focus can still leave, the
 * result is worse than saying nothing: the user tabs to controls their screen
 * reader now refuses to describe. The game board behind the victory and
 * game-over dialogs holds ~130 tabbable tiles, so that gap was wide.
 *
 * This hook supplies the missing half:
 *   - moves focus into the dialog on open (preferring `[data-autofocus]`)
 *   - traps Tab / Shift+Tab inside it
 *   - closes on Escape, but only when the dialog is dismissible
 *   - recovers if the focused control unmounts under it
 *   - returns focus to whatever opened it
 *
 * `inert` on the background subtree (see App.tsx and MainMenu.tsx) is the
 * belt to this braces: it takes those tiles out of the tab order entirely,
 * so the trap has almost nothing left to fight.
 */

// Order matters: this is used for "first focusable", so it must reflect
// document order, which `querySelectorAll` guarantees for a single selector.
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

/**
 * Visible, focusable descendants, recomputed on every Tab rather than cached.
 * GameOverModal enables and disables its Undo/Magnet buttons as boosters are
 * spent, so a list captured on open would trap focus on a dead control.
 */
const focusablesIn = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    // getClientRects() is empty for display:none and for a collapsed subtree,
    // which is how a hidden-but-present control gets skipped.
    .filter(el => el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true');

interface UseModalDialogOptions {
  /**
   * Called for Escape. Omit for a dialog with no safe cancel action — the
   * victory and game-over screens sit on a finished run, so dismissing them
   * would leave the player looking at a board they can't play.
   */
  onDismiss?: (() => void) | undefined;
}

export function useModalDialog({ onDismiss }: UseModalDialogOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Read handlers through a ref so the listeners can register once, on mount,
  // instead of re-binding whenever the parent re-renders a new closure.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  const focusFirst = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = focusablesIn(container);
    // Honour [data-autofocus] only if it is actually focusable right now. A
    // preferred control can be disabled (GameOverModal's Undo with no boosters
    // left), and .focus() on a disabled button silently does nothing — which
    // would strand focus on <body>, outside the trap.
    const preferred = container.querySelector<HTMLElement>('[data-autofocus]');
    const target = (preferred && items.includes(preferred) ? preferred : items[0]) ?? container;
    target.focus();
  }, []);

  // Move focus in on open, and hand it back on close. Capturing the trigger
  // here (rather than in the opener) keeps every caller from having to
  // remember to do it.
  useEffect(() => {
    const active = document.activeElement;
    // Safari doesn't focus a <button> on click, so activeElement is often <body>
    // — which is not a restore target worth keeping.
    const trigger = active && active !== document.body ? (active as HTMLElement) : null;
    focusFirst();
    return () => {
      // The trigger may itself have gone (the footer's Restart button unmounts
      // the dialog AND rebuilds the board), so check before reaching for it.
      if (!trigger || !trigger.isConnected || typeof trigger.focus !== 'function') return;
      trigger.focus();
      // The trigger usually sits in the subtree that was `inert` while the
      // dialog was up. That attribute is removed in the same commit, but a
      // focus() call on a still-inert element is silently ignored — so if it
      // didn't take, try again once the commit has settled.
      if (document.activeElement !== trigger) {
        requestAnimationFrame(() => {
          if (trigger.isConnected) trigger.focus();
        });
      }
    };
  }, [focusFirst]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const dismiss = onDismissRef.current;
        if (dismiss) {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusablesIn(container);
      if (items.length === 0) {
        // Nothing to move between — hold focus on the container itself.
        e.preventDefault();
        container.focus();
        return;
      }

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      // Wrap at the ends. Focus resting on the container (no item focused yet)
      // counts as "before the first", so Tab enters and Shift+Tab goes to last.
      if (e.shiftKey && (active === first || active === container || !container.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !container.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    // Focus can be lost without any Tab press: clicking Claim unmounts that
    // button, and the browser drops focus to <body> — outside the trap, with no
    // key event to intercept. Pull it back on the next frame.
    const onFocusOut = () => {
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el || !el.isConnected) return;
        if (!el.contains(document.activeElement)) focusFirst();
      });
    };

    container.addEventListener('keydown', onKeyDown);
    container.addEventListener('focusout', onFocusOut);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('focusout', onFocusOut);
    };
  }, [focusFirst]);

  return containerRef;
}

export default useModalDialog;
