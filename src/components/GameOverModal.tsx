import React from 'react';
import type { PowerKey } from '../hooks/useBoosters';
import ModalShell from './ModalShell';
import { UndoIcon, MagnetIcon, RestartIcon, BackIcon } from './SvgIcons';

interface GameOverModalProps {
  trayCapacity: number;
  score: number;
  clearedCount: number;
  totalTileCount: number;
  powerCounts: Record<PowerKey, number>;
  canReturnTile: boolean;   // there is something in the tray to pull back
  onUndo: () => void;
  onMagnet: () => void;
  onRestart: () => void;
  onBackToMenu: () => void;
}

/**
 * Tray full with no match — the run is over unless a booster rescues it.
 * `alertdialog` so screen readers announce the loss rather than leaving the
 * player wondering why taps stopped working.
 */
const GameOverModal: React.FC<GameOverModalProps> = ({
  trayCapacity,
  score,
  clearedCount,
  totalTileCount,
  powerCounts,
  canReturnTile,
  onUndo,
  onMagnet,
  onRestart,
  onBackToMenu
}) => {
  const hasRescue = powerCounts.undo > 0 || powerCounts.magnet > 0;
  return (
    // No onDismiss: the run has ended, so there is nothing to dismiss to. The
    // player picks a rescue, a restart, or the menu. Focus lands on the first
    // ENABLED button, which is the best available recovery.
    <ModalShell
      role="alertdialog"
      labelledBy="gameover-title"
      describedBy="gameover-desc"
      overlayClassName="animate-fade-in"
      className="stalemate-modal text-center animate-scale-up"
    >
      <h2 id="gameover-title" style={{ color: '#ff8a80' }}>Tray Full!</h2>
      <p id="gameover-desc">
        Your tray reached {trayCapacity} tiles with no match.
        {hasRescue
          ? ' Use an Undo or Magnet to pull tiles back and keep playing, or restart!'
          : ' You are out of rescues — restart the level to try again!'}
      </p>
      <div className="victory-stats">
        <div className="v-stat">
          <span className="v-stat-lbl">IQ</span>
          <span className="v-stat-val">{score.toLocaleString()}</span>
        </div>
        <div className="v-stat">
          <span className="v-stat-lbl">Tiles Cleared</span>
          <span className="v-stat-val">{clearedCount} / {totalTileCount}</span>
        </div>
      </div>
      <div className="stalemate-buttons">
        <button
          className="confirm-btn glassmorphism"
          onClick={onUndo}
          disabled={powerCounts.undo <= 0 || !canReturnTile}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UndoIcon size={16} inline /> Return a Tile ({powerCounts.undo})
        </button>
        <button
          className="confirm-btn glassmorphism"
          onClick={onMagnet}
          disabled={powerCounts.magnet <= 0 || !canReturnTile}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <MagnetIcon size={16} inline /> Magnet ({powerCounts.magnet})
        </button>
        {/* Restarts the CURRENT level, not the layout's base level */}
        <button className="confirm-btn glassmorphism" onClick={onRestart} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RestartIcon size={16} inline /> Restart
        </button>
        <button className="cancel-btn glassmorphism" onClick={onBackToMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BackIcon size={16} inline /> Main Menu
        </button>
      </div>
    </ModalShell>
  );
};

export default GameOverModal;
