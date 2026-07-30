import React from 'react';

interface LiveRegionProps {
  /** The current narration. Changing it is what triggers an announcement. */
  message: string;
  /**
   * 'polite' waits for a pause (routine board feedback); 'assertive' interrupts
   * (the run just ended). Anything announced on every tap must be polite, or a
   * screen reader user can never finish hearing a sentence.
   */
  urgency?: 'polite' | 'assertive';
}

/**
 * Visually hidden narration for screen readers.
 *
 * The board is a grid of divs whose meaning is entirely visual — colour and
 * dimming say which tiles are playable, and nothing announced the tray filling
 * up or the tile count dropping. This is the non-visual channel for that.
 *
 * Rendered unconditionally (never behind a `&&`): a live region has to exist in
 * the DOM *before* its text changes, or assistive tech has nothing to observe
 * and the first announcement is dropped.
 */
const LiveRegion: React.FC<LiveRegionProps> = ({ message, urgency = 'polite' }) => (
  <div
    className="sr-only"
    role="status"
    aria-live={urgency}
    aria-atomic="true"
  >
    {message}
  </div>
);

export default LiveRegion;
