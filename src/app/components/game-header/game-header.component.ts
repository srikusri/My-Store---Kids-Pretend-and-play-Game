import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { SoundService } from '../../services/sound.service';
import { WalletService } from '../../services/wallet.service';
import { PersonaType } from '../../models/wallet.model';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [CommonModule, FormsModule, SettingsComponent],
  template: `
    <div class="game-header">
      <div class="player-info">
        <div class="avatar">
          <span class="avatar-emoji">👦</span>
          <div class="level-badge">{{ gameService.level() }}</div>
        </div>
        <div class="player-stats">
          <h3 (click)="editStoreName()" class="store-name-title" [title]="'Click to edit'">
            {{ storeName() }}
          </h3>
          <div class="xp-bar">
            <div class="xp-fill" [style.width.%]="gameService.progressPercentage()"></div>
            <span class="xp-text">Level {{ gameService.level() }}</span>
          </div>
        </div>
      </div>

      <div class="game-stats">
        <div class="stat-item coins" (click)="playSound()">
          <span class="stat-icon">🪙</span>
          <span class="stat-value">{{ gameService.coins() }}</span>
        </div>
        <div class="stat-item score">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ gameService.score() }}</span>
        </div>
        <div class="stat-item streak">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">{{ gameService.gameState().dailyStreak }}</span>
        </div>
      </div>

      <div class="header-actions">
        <button class="sound-toggle" (click)="toggleSound()" [title]="gameService.soundEnabled() ? 'Mute' : 'Unmute'">
          <span *ngIf="gameService.soundEnabled()">🔊</span>
          <span *ngIf="!gameService.soundEnabled()">🔇</span>
        </button>
        <app-settings></app-settings>
      </div>
    </div>

    <!-- Welcome/Store Name Setup Modal -->
    @if (showStoreNameModal()) {
      <div class="modal-overlay" (click)="$event.stopPropagation()">
        <div class="modal-content welcome-modal" (click)="$event.stopPropagation()">
          <div class="modal-header welcome-header">
            <h2>🏪 Welcome to Your Store!</h2>
          </div>
          
          <div class="modal-body">
            <div class="welcome-content">
              <div class="welcome-icon">🎉</div>
              <h3>Let's set up your store!</h3>
              <p>What would you like to name your store?</p>
              
              <div class="store-name-input-group">
                <input 
                  type="text" 
                  [(ngModel)]="tempStoreName"
                  class="store-name-input"
                  placeholder="My Awesome Store"
                  maxlength="30"
                  (keyup.enter)="saveStoreName()"
                  autofocus>
                <div class="character-count">{{ tempStoreName().length }}/30</div>
              </div>

              <div class="suggestions">
                <p class="suggestion-label">Or try one of these:</p>
                <div class="suggestion-chips">
                  <button class="suggestion-chip" (click)="tempStoreName.set('Happy Market')">🛒 Happy Market</button>
                  <button class="suggestion-chip" (click)="tempStoreName.set('Kid\\'s Corner Store')">🏪 Kid's Corner Store</button>
                  <button class="suggestion-chip" (click)="tempStoreName.set('Super Shop')">⭐ Super Shop</button>
                  <button class="suggestion-chip" (click)="tempStoreName.set('Treasure Trove')">💎 Treasure Trove</button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              class="btn btn-primary btn-large" 
              (click)="saveStoreName()"
              [disabled]="!tempStoreName().trim()">
              🚀 Start My Store!
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .game-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      gap: 1.5rem;
    }

    .player-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      position: relative;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }

    .avatar-emoji {
      font-size: 1.5rem;
    }

    .level-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #FFC312;
      color: #333;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.75rem;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .player-stats {
      flex: 1;
    }

    .player-stats h3 {
      margin: 0 0 0.375rem 0;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .xp-bar {
      width: 180px;
      height: 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .xp-fill {
      height: 100%;
      background: linear-gradient(90deg, #FFC312, #FFA502);
      transition: width 0.5s ease;
      border-radius: 8px;
    }

    .xp-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.688rem;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .game-stats {
      display: flex;
      gap: 0.75rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      transition: transform 0.2s, background 0.2s;
      cursor: pointer;
    }

    .stat-item:hover {
      transform: scale(1.05);
      background: rgba(255, 255, 255, 0.3);
    }

    .stat-icon {
      font-size: 1.25rem;
      animation: bounce 2s infinite;
    }

    .stat-value {
      font-weight: 700;
      font-size: 1rem;
    }

    .store-name-title {
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .store-name-title:hover {
      opacity: 0.8;
      transform: scale(1.02);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .sound-toggle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .sound-toggle:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    /* Welcome Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s;
    }

    .welcome-modal {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      animation: bounceIn 0.5s;
    }

    .welcome-header {
      background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%);
      color: white;
      padding: 2rem;
      border-radius: 20px 20px 0 0;
      text-align: center;
    }

    .welcome-header h2 {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
    }

    .welcome-content {
      text-align: center;
      padding: 2rem;
    }

    .welcome-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: bounce 1s infinite;
    }

    .welcome-content h3 {
      font-size: 1.75rem;
      margin: 1rem 0;
      color: #333;
    }

    .welcome-content p {
      font-size: 1.125rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .store-name-input-group {
      margin-bottom: 2rem;
    }

    .store-name-input {
      width: 100%;
      padding: 1.25rem 1.5rem;
      font-size: 1.25rem;
      border: 3px solid #e0e0e0;
      border-radius: 16px;
      text-align: center;
      font-weight: 600;
      transition: all 0.3s;
    }

    .store-name-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      transform: scale(1.02);
    }

    .character-count {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #999;
    }

    .suggestions {
      margin-top: 2rem;
    }

    .suggestion-label {
      font-size: 0.938rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    .suggestion-chip {
      padding: 0.75rem 1.25rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 24px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion-chip:hover {
      border-color: #667eea;
      background: #f5f7ff;
      transform: translateY(-2px);
    }

    .modal-footer {
      padding: 1.5rem 2rem 2rem;
      text-align: center;
    }

    .modal-footer .btn {
      width: 100%;
      max-width: 400px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes bounceIn {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    @media (max-width: 768px) {
      .game-header {
        flex-wrap: wrap;
        padding: 0.625rem 0.875rem;
        gap: 0.75rem;
      }

      .player-info {
        gap: 0.625rem;
      }

      .avatar {
        width: 42px;
        height: 42px;
      }

      .avatar-emoji {
        font-size: 1.25rem;
      }

      .level-badge {
        width: 22px;
        height: 22px;
        font-size: 0.688rem;
      }

      .player-stats h3 {
        font-size: 0.813rem;
      }

      .xp-bar {
        width: 140px;
        height: 18px;
      }

      .xp-text {
        font-size: 0.625rem;
      }

      .game-stats {
        order: 3;
        width: 100%;
        justify-content: space-around;
        gap: 0.5rem;
      }

      .stat-item {
        padding: 0.375rem 0.75rem;
        flex: 1;
        justify-content: center;
      }

      .stat-icon {
        font-size: 1.125rem;
      }

      .stat-value {
        font-size: 0.938rem;
      }

      .sound-toggle {
        width: 38px;
        height: 38px;
        font-size: 1.125rem;
      }
    }

    @media (max-width: 480px) {
      .game-header {
        padding: 0.5rem 0.75rem;
      }

      .player-stats h3 {
        font-size: 0.75rem;
      }

      .xp-bar {
        width: 120px;
        height: 16px;
      }

      .stat-item {
        padding: 0.313rem 0.625rem;
      }

      .stat-icon {
        font-size: 1rem;
      }

      .stat-value {
        font-size: 0.875rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameHeaderComponent {
  private readonly STORE_NAME_KEY = 'kids_store_name';
  
  storeName = signal<string>('');
  showStoreNameModal = signal(false);
  tempStoreName = signal('');

  constructor(
    public gameService: GameService,
    private soundService: SoundService,
    private walletService: WalletService
  ) {
    this.loadStoreName();
  }

  private loadStoreName(): void {
    const saved = localStorage.getItem(this.STORE_NAME_KEY);
    if (saved) {
      this.storeName.set(saved);
    } else {
      // First time seller - show welcome modal
      // Buyers don't need a store name
      const persona = this.walletService.persona();
      if (persona?.type === PersonaType.SELLER) {
        this.showStoreNameModal.set(true);
        this.tempStoreName.set('');
      } else {
        // Default name for buyers
        this.storeName.set('My Shop');
      }
    }
  }

  editStoreName(): void {
    this.tempStoreName.set(this.storeName());
    this.showStoreNameModal.set(true);
    this.soundService.playSound('click');
  }

  saveStoreName(): void {
    const name = this.tempStoreName().trim();
    if (name) {
      this.storeName.set(name);
      localStorage.setItem(this.STORE_NAME_KEY, name);
      this.showStoreNameModal.set(false);
      this.soundService.playSound('success');
    }
  }

  toggleSound(): void {
    this.gameService.toggleSound();
    this.soundService.setEnabled(this.gameService.soundEnabled());
    this.soundService.playSound('click');
  }

  playSound(): void {
    this.soundService.playSound('coin');
  }
}

