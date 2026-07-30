import React from 'react';
import { PlayIcon } from './SvgIcons';

interface TutorialModalProps {
  trayCapacity: number;
  onDismiss: () => void;
}

/** First-run rules card, shown once and then remembered. */
const TutorialModal: React.FC<TutorialModalProps> = ({ trayCapacity, onDismiss }) => (
  <div className="modal-overlay animate-fade-in" onClick={onDismiss}>
    <div
      className="modal-container glassmorphism tutorial-modal animate-scale-up"
      onClick={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="modal-header">
        <h2 id="tutorial-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>👋 How to Play</h2>
      </div>
      <div className="modal-content">
        <ol className="rules-grid">
          <li className="rule-item">
            <span className="rule-num" aria-hidden="true">1</span>
            <div>
              <h4>Tap a bright tile</h4>
              <p>Only <strong>bright, free</strong> tiles can be picked. A tile is free when nothing rests on top of it and at least one side (left or right) is open. Dimmed tiles are blocked.</p>
            </div>
          </li>
          <li className="rule-item">
            <span className="rule-num" aria-hidden="true">2</span>
            <div>
              <h4>It goes to your tray</h4>
              <p>Tapped tiles slide into the tray at the top. You have <strong>{trayCapacity} slots</strong>.</p>
            </div>
          </li>
          <li className="rule-item">
            <span className="rule-num" aria-hidden="true">3</span>
            <div>
              <h4>Pairs clear automatically</h4>
              <p>When two of the <strong>same tile</strong> meet in the tray, they vanish and score points. Clear the whole board to win!</p>
            </div>
          </li>
          <li className="rule-item">
            <span className="rule-num" aria-hidden="true">4</span>
            <div>
              <h4>Don't fill the tray!</h4>
              <p>If all {trayCapacity} slots fill with no match, it's game over. Stuck? Use <strong>Shuffle</strong>, <strong>Hint</strong>, or <strong>Undo</strong>.</p>
            </div>
          </li>
        </ol>
      </div>
      <div className="modal-footer">
        <button className="confirm-btn glassmorphism" onClick={onDismiss}>
          <PlayIcon size={16} inline /> Let's Play!
        </button>
      </div>
    </div>
  </div>
);

export default TutorialModal;
