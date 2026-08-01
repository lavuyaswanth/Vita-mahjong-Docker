import React from 'react';
import { layouts, MAX_LEVEL } from '../skyjong/layouts';
import type { LayoutName } from '../skyjong/layouts';
import { nextRealmChange } from '../skyjong/realms';
import { POWER_LABELS } from '../hooks/useBoosters';
import type { PowerKey } from '../hooks/useBoosters';
import { formatTime } from '../skyjong/formatTime';
import type { LevelRecord } from '../skyjong/records';
import { IQ_MAX } from '../skyjong/records';
import ModalShell from './ModalShell';
import { EarnedStampIcon, BackIcon } from './SvgIcons';

// Brain-tier label for the final IQ (see IQ_MAX)
const iqTier = (iq: number): string => {
  if (iq >= IQ_MAX) return '🧠 Genius';
  if (iq >= 180) return '🧠 Brilliant';
  if (iq >= 160) return '✨ Sharp';
  if (iq >= 130) return '👍 Clever';
  return '🌱 Warming Up';
};

interface VictoryModalProps {
  dailyMode: boolean;
  dailyStreak: number;
  score: number;
  earnedStars: number;
  isNewBest: boolean;
  bestRecord: LevelRecord | null;
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
  dailyMode,
  dailyStreak,
  score,
  earnedStars,
  isNewBest,
  bestRecord,
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
}) => {
  const hasNextLevel = !dailyMode && currentLevel < MAX_LEVEL;
  const nxt = hasNextLevel ? nextRealmChange(currentLevel) : null;

  return (
    // No onDismiss: the board behind is cleared, so dismissing would leave the
    // player staring at an empty level with no way forward. They pick Next Level
    // or Main Menu.
    <ModalShell
      role="alertdialog"
      labelledBy="victory-title"
      describedBy="victory-summary"
      overlayClassName="victory-overlay animate-fade-in"
      className={`victory-modal text-center animate-scale-up ${score >= IQ_MAX ? 'genius-win' : ''}`.trim()}
    >
      <div className="victory-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
        <EarnedStampIcon size={64} />
      </div>
      <h2 id="victory-title">{dailyMode ? 'Daily Cleared!' : 'Puzzle Solved!'}</h2>

      {/* Star rating. The glyphs are decorative — the count is announced once. */}
      <div className="victory-stars" role="img" aria-label={`${earnedStars} of 3 stars`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={`star-icon ${i < earnedStars ? 'star-earned' : 'star-empty'}`} aria-hidden="true">
            {i < earnedStars ? '⭐' : '☆'}
          </span>
        ))}
      </div>
      <div className="victory-iq-tier">{iqTier(score)} · IQ {score}</div>

      {dailyMode
        ? <div className="victory-best new-best">🔥 {dailyStreak}-day streak!</div>
        : isNewBest
        ? <div className="victory-best new-best">🌟 New Best! IQ {bestRecord?.iq} · {formatTime(bestRecord?.time ?? finalTime)}</div>
        : bestRecord && <div className="victory-best">Best: IQ {bestRecord.iq} · {formatTime(bestRecord.time)}</div>}

      {/* aria-describedby points at this whole block, so the achievements are
          part of what gets read when the dialog opens. */}
      <div id="victory-summary">
        <p>
          Congratulations! You cleared all tiles in {formatTime(finalTime)} with {moveCount} moves,
          scoring an IQ of {score} and earning {earnedStars} of 3 stars.
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
          <span className="v-stat-lbl">Final IQ</span>
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

      {/* Dangle the next realm to pull the player onward (campaign only) */}
      {nxt && (
        <div className="realm-teaser">
          🔓 <strong>{nxt.realm.name}</strong>{' '}
          {nxt.atLevel - currentLevel <= 1 ? 'unlocks next!' : `awaits at Level ${nxt.atLevel}`}
        </div>
      )}
      {dailyMode && (
        <div className="realm-teaser">🗓️ Come back tomorrow to keep your streak alive!</div>
      )}

      <div className="victory-buttons">
        {hasNextLevel && (
          <button
            className="confirm-btn glassmorphism"
            onClick={onNextLevel}
            // The onward action gets focus. Deliberately NOT the Claim button:
            // that one unmounts the moment it is pressed, which would drop focus
            // to <body> and out of the trap.
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
};

export default VictoryModal;
