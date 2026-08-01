import React from 'react';
import { layouts, MAX_LEVEL } from '../skyjong/layouts';
import type { LayoutName } from '../skyjong/layouts';
import { POWER_LABELS } from '../hooks/useBoosters';
import type { PowerKey } from '../hooks/useBoosters';
import { formatTime } from '../skyjong/formatTime';
import { EarnedStampIcon, BackIcon } from './SvgIcons';
import ModalShell from './ModalShell';

interface VictoryModalProps {
  score: number;
  earnedStars: number;
  /** Elapsed seconds frozen at the moment the run ended. */
  finalTime: number;
  moveCount: number;
  activeLayout: LayoutName;
  currentLevel: number;
  /**
   * Achievements earned by this run. Rendered HERE rather than left to the
   * page-level live region: they unlock in the same commit that opens this
   * dialog, and `aria-modal="true"` hides everything outside it from a screen
   * reader — so the region that used to announce them is masked at exactly the
   * moment they fire. The toast has the same problem visually, and only ever
   * shows the last of a batch.
   */
  unlockedAchievements?: { name: string; desc: string }[];
  levelReward: { power: PowerKey; amount: number } | null;
  rewardClaimed: boolean;
  onClaimReward: () => void;
  onNextLevel: () => void;
  onBackToMenu: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  earnedStars,
  finalTime,
  moveCount,
  activeLayout,
  currentLevel,
  unlockedAchievements = [],
  levelReward,
  rewardClaimed,
  onClaimReward,
  onNextLevel,
  onBackToMenu
}) => (
  // No onDismiss: the board behind is cleared, so dismissing would leave the
  // player looking at a finished board. They have to pick an action.
  <ModalShell
    role="alertdialog"
    labelledBy="victory-title"
    describedBy="victory-summary"
    overlayClassName="victory-overlay animate-fade-in"
    className="victory-modal text-center animate-scale-up"
  >
      <div className="victory-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
        <EarnedStampIcon size={64} />
      </div>
      <h2 id="victory-title">Puzzle Solved!</h2>

      {/* Star rating. The glyphs are decorative — the count is announced once. */}
      <div className="victory-stars" role="img" aria-label={`${earnedStars} of 3 stars`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={`star-icon ${i < earnedStars ? 'star-earned' : 'star-empty'}`} aria-hidden="true">
            {i < earnedStars ? '⭐' : '☆'}
          </span>
        ))}
      </div>

      {/* aria-describedby points at this whole block, so the achievements are
          part of what gets read when the dialog opens. */}
      <div id="victory-summary">
        <p>
          Congratulations! You cleared all tiles in {formatTime(finalTime)} with {moveCount} moves,
          scoring {score} and earning {earnedStars} of 3 stars.
        </p>
        {unlockedAchievements.length > 0 && (
          <ul className="victory-achievements">
            {unlockedAchievements.map(a => (
              <li key={a.name}>
                🏆 Achievement unlocked: <strong>{a.name}</strong> — {a.desc}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="victory-stats">
        <div className="v-stat">
          <span className="v-stat-lbl">Final Score</span>
          <span className="v-stat-val">{score.toLocaleString()}</span>
        </div>
        <div className="v-stat">
          <span className="v-stat-lbl">Time</span>
          <span className="v-stat-val">{formatTime(finalTime)}</span>
        </div>
        <div className="v-stat">
          <span className="v-stat-lbl">Moves</span>
          <span className="v-stat-val">{moveCount}</span>
        </div>
        <div className="v-stat">
          <span className="v-stat-lbl">Layout</span>
          <span className="v-stat-val">{layouts[activeLayout].displayName}</span>
        </div>
      </div>

      {/* Random power-up reward for clearing the level */}
      {levelReward && (
        <div className={`reward-card ${rewardClaimed ? 'claimed' : ''}`}>
          {!rewardClaimed ? (
            <>
              <div className="reward-headline">
                🎁 Level reward: <strong>+{levelReward.amount} {POWER_LABELS[levelReward.power]}</strong>
              </div>
              <div className="reward-buttons">
                <button className="confirm-btn glassmorphism reward-claim-btn" onClick={onClaimReward}>
                  Claim +{levelReward.amount}
                </button>
              </div>
            </>
          ) : (
            <div className="reward-headline reward-done" role="status">
              ✅ Added <strong>{POWER_LABELS[levelReward.power]}</strong> to your boosters!
            </div>
          )}
        </div>
      )}

      <div className="victory-buttons">
        {currentLevel < MAX_LEVEL && (
          <button
            className="confirm-btn glassmorphism"
            onClick={onNextLevel}
            data-autofocus
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
              background: 'linear-gradient(to bottom, #d4af37 0%, #a8841a 100%)',
              color: '#1a0f09',
              borderColor: '#ffd700',
              fontWeight: 'bold'
            }}
          >
            Next Level ➡️
          </button>
        )}
        <button className="cancel-btn glassmorphism" onClick={onBackToMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <BackIcon size={16} inline /> Main Menu
        </button>
      </div>
  </ModalShell>
);

export default VictoryModal;
