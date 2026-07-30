import React from 'react';
import { useModalDialog } from '../hooks/useModalDialog';

interface ModalShellProps {
  children: React.ReactNode;
  /**
   * 'dialog' for informational panels, 'alertdialog' for a dialog that reports
   * something the player needs to react to (the run ended).
   */
  role?: 'dialog' | 'alertdialog';
  /** id of the heading that names the dialog. */
  labelledBy?: string;
  /** id of the element summarising it — required by alertdialog to be useful. */
  describedBy?: string;
  /** Use when there is no visible heading to point `labelledBy` at. */
  label?: string;
  /**
   * Omit to make the dialog non-dismissible: no Escape, no backdrop click. The
   * victory and game-over dialogs sit on a finished run, so there is nothing
   * sensible to dismiss them TO — the player has to pick an action.
   */
  onDismiss?: () => void;
  /** Extra classes after `modal-overlay`. */
  overlayClassName?: string;
  /** Extra classes after `modal-container glassmorphism`. */
  className?: string;
}

/**
 * The shared chrome for every modal in the app: the backdrop, the container,
 * the ARIA wiring, and the focus management from `useModalDialog`.
 *
 * Class names are passed through rather than baked in, so each modal keeps the
 * exact DOM it had before — this is a behaviour change, not a restyle.
 *
 * Render this conditionally (`{open && <ModalShell>}`) rather than having it
 * return null when closed: mounting is what triggers the focus move, and
 * unmounting is what restores focus to the trigger.
 */
const ModalShell: React.FC<ModalShellProps> = ({
  children,
  role = 'dialog',
  labelledBy,
  describedBy,
  label,
  onDismiss,
  overlayClassName = '',
  className = ''
}) => {
  const containerRef = useModalDialog({ onDismiss });

  return (
    <div
      className={`modal-overlay ${overlayClassName}`.trim()}
      // Backdrop click dismisses only where Escape does, so the two agree.
      onClick={onDismiss ? () => onDismiss() : undefined}
    >
      <div
        ref={containerRef}
        className={`modal-container glassmorphism ${className}`.trim()}
        // Stop a click inside the panel reaching the backdrop handler above.
        onClick={e => e.stopPropagation()}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-label={label}
        // Focusable as a last resort, so a dialog with no controls (or one whose
        // focused control just unmounted) still has somewhere to put focus.
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
