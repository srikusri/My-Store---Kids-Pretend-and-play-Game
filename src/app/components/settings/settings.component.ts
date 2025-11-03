import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { InventoryService } from '../../services/inventory.service';
import { SoundService } from '../../services/sound.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <button class="settings-icon-btn" (click)="showModal = true" title="Settings">
      ⚙️
    </button>

    @if (showModal) {
      <div class="modal-overlay" (click)="showModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>⚙️ Settings</h2>
            <button class="close-button" (click)="showModal = false">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="settings-section">
              <h3>🔊 Sound</h3>
              <div class="setting-item">
                <span>Sound Effects</span>
                <button 
                  [class]="'btn ' + (gameService.soundEnabled() ? 'btn-primary' : 'btn-secondary')"
                  (click)="toggleSound()">
                  {{ gameService.soundEnabled() ? '🔊 On' : '🔇 Off' }}
                </button>
              </div>
            </div>

            <div class="settings-section">
              <h3>💱 Currency</h3>
              <div class="setting-item">
                <label for="currency-select" class="currency-label">
                  <span class="label-text">Select your currency:</span>
                  <span class="current-currency">{{ getCurrentCurrencyDisplay() }}</span>
                </label>
                <select 
                  id="currency-select"
                  class="currency-select"
                  [value]="getCurrentCurrencyCode()"
                  (change)="onCurrencyChange($any($event.target).value)">
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="JPY">¥ Japanese Yen (JPY)</option>
                  <option value="CNY">¥ Chinese Yuan (CNY)</option>
                  <option value="AUD">A$ Australian Dollar (AUD)</option>
                  <option value="CAD">C$ Canadian Dollar (CAD)</option>
                  <option value="CHF">Fr Swiss Franc (CHF)</option>
                  <option value="SEK">kr Swedish Krona (SEK)</option>
                  <option value="NZD">NZ$ New Zealand Dollar (NZD)</option>
                  <option value="SGD">S$ Singapore Dollar (SGD)</option>
                  <option value="HKD">HK$ Hong Kong Dollar (HKD)</option>
                  <option value="KRW">₩ South Korean Won (KRW)</option>
                  <option value="MXN">Mex$ Mexican Peso (MXN)</option>
                  <option value="BRL">R$ Brazilian Real (BRL)</option>
                  <option value="ZAR">R South African Rand (ZAR)</option>
                  <option value="AED">د.إ UAE Dirham (AED)</option>
                  <option value="SAR">ر.س Saudi Riyal (SAR)</option>
                  <option value="TRY">₺ Turkish Lira (TRY)</option>
                </select>
              </div>
            </div>

            <div class="settings-section">
              <h3>📊 Your Progress</h3>
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-label">Level</div>
                  <div class="stat-value">{{ gameService.level() }}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Coins</div>
                  <div class="stat-value">{{ gameService.coins() }}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Score</div>
                  <div class="stat-value">{{ gameService.score() }}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Streak</div>
                  <div class="stat-value">{{ gameService.gameState().dailyStreak }} 🔥</div>
                </div>
              </div>
              <div class="info-box">
                <p>📦 Items in Store: {{ inventoryService.inventoryCount() }}</p>
                <p>🏆 Achievements: {{ unlockedAchievements() }} / {{ totalAchievements() }}</p>
              </div>
            </div>

            <div class="settings-section danger-zone">
              <h3>⚠️ Danger Zone</h3>
              <p class="warning-text">
                These actions cannot be undone!
              </p>
              
              <div class="danger-actions">
                <button 
                  class="btn btn-danger danger-btn"
                  (click)="confirmClearInventory()">
                  🗑️ Clear Inventory Only
                </button>
                
                <button 
                  class="btn btn-danger danger-btn"
                  (click)="confirmResetProgress()">
                  🔄 Reset Game Progress
                </button>
                
                <button 
                  class="btn btn-danger danger-btn"
                  (click)="confirmResetEverything()">
                  💥 Reset Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showConfirmModal()) {
      <div class="modal-overlay confirm-overlay" (click)="cancelReset()">
        <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header warning-header">
            <h2>⚠️ Are You Sure?</h2>
          </div>
          
          <div class="modal-body">
            <div class="confirm-content">
              <div class="warning-icon">{{ confirmIcon() }}</div>
              <h3>{{ confirmTitle() }}</h3>
              <p>{{ confirmMessage() }}</p>
              
              @if (resetType() === 'everything') {
                <div class="severe-warning">
                  <strong>This will delete:</strong>
                  <ul>
                    <li>All your progress (Level, XP, Coins, Score)</li>
                    <li>All achievements</li>
                    <li>All items in your store</li>
                    <li>Your daily streak</li>
                  </ul>
                  <p><strong>You will start from Level 1 with nothing!</strong></p>
                </div>
              }
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelReset()">
              ❌ Cancel - Keep My Data
            </button>
            <button class="btn btn-danger pulse-danger" (click)="confirmReset()">
              ✓ Yes, Reset {{ resetType() === 'everything' ? 'Everything' : 'It' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (showSuccessModal()) {
      <div class="modal-overlay" (click)="closeSuccessModal()">
        <div class="modal-content success-modal" (click)="$event.stopPropagation()">
          <div class="modal-header success-header">
            <h2>✅ Reset Complete!</h2>
          </div>
          
          <div class="modal-body">
            <div class="success-content">
              <div class="success-icon">🎉</div>
              <p>{{ successMessage() }}</p>
              <p class="success-subtext">Ready for a fresh start!</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" (click)="closeSuccessModal()">
              🚀 Continue Playing
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .settings-icon-btn {
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

    .settings-icon-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1) rotate(90deg);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    .confirm-overlay {
      z-index: 1001;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s;
    }

    .confirm-modal {
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px 20px 0 0;
    }

    .warning-header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    }

    .success-header {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.75rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 3rem;
      color: white;
      cursor: pointer;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
      line-height: 1;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 2rem;
    }

    .settings-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        color: #333;
      }
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 12px;
      flex-wrap: wrap;
      gap: 1rem;

      span {
        font-weight: 500;
        color: #333;
      }
    }

    .currency-label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;

      .label-text {
        font-weight: 600;
        color: #495057;
      }

      .current-currency {
        font-size: 1.5rem;
        font-weight: 700;
        color: #28a745;
      }
    }

    .currency-select {
      flex: 1;
      min-width: 250px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      font-weight: 600;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      background: white;
      color: #333;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #667eea;
      }

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      option {
        padding: 0.5rem;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .info-box {
      background: #e3f2fd;
      padding: 1rem;
      border-radius: 12px;
      border-left: 4px solid #2196f3;

      p {
        margin: 0.5rem 0;
        font-weight: 500;
        color: #1976d2;
      }
    }

    .danger-zone {
      background: #fff5f5;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid #ffebee;
    }

    .warning-text {
      color: #d32f2f;
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .danger-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .danger-btn {
      width: 100%;
      font-weight: 600;
    }

    .confirm-content {
      text-align: center;
    }

    .warning-icon, .success-icon {
      font-size: 4rem;
      margin: 1rem 0;
      animation: bounce 0.5s;
    }

    .confirm-content h3 {
      font-size: 1.5rem;
      margin: 1rem 0;
      color: #333;
    }

    .confirm-content p {
      font-size: 1.125rem;
      color: #666;
      margin: 1rem 0;
    }

    .severe-warning {
      background: #ffebee;
      padding: 1.5rem;
      border-radius: 12px;
      margin-top: 1.5rem;
      text-align: left;
      border: 2px solid #ef5350;

      strong {
        color: #c62828;
        font-size: 1.125rem;
      }

      ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
        color: #d32f2f;
      }

      li {
        margin: 0.5rem 0;
      }

      p {
        margin: 1rem 0 0 0;
        color: #b71c1c;
        font-weight: 700;
        font-size: 1rem;
      }
    }

    .success-content {
      padding: 2rem 0;
    }

    .success-subtext {
      color: #4caf50 !important;
      font-weight: 600;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 2px solid #f0f0f0;
      flex-wrap: wrap;

      button {
        flex: 1;
        min-width: 150px;
      }
    }

    .pulse-danger {
      animation: pulseDanger 1.5s infinite;
    }

    @keyframes pulseDanger {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 20px 10px rgba(244, 67, 54, 0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-body {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .modal-footer {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  showModal = false;
  showConfirmModal = signal(false);
  showSuccessModal = signal(false);
  resetType = signal<'inventory' | 'progress' | 'everything'>('inventory');
  
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmIcon = signal('');
  successMessage = signal('');

  constructor(
    public gameService: GameService,
    public inventoryService: InventoryService,
    private soundService: SoundService,
    public currencyService: CurrencyService
  ) {}

  toggleSound(): void {
    this.gameService.toggleSound();
    this.soundService.setEnabled(this.gameService.soundEnabled());
    this.soundService.playSound('click');
  }

  onCurrencyChange(currencyCode: string): void {
    this.currencyService.setCurrency(currencyCode);
    this.soundService.playSound('success');
  }

  getCurrentCurrencyCode(): string {
    try {
      return this.currencyService.currencyCode();
    } catch (error) {
      console.error('Error getting currency code:', error);
      return 'USD';
    }
  }

  getCurrentCurrencyDisplay(): string {
    try {
      const curr = this.currencyService.currency();
      return `${curr.symbol} ${curr.code}`;
    } catch (error) {
      console.error('Error getting currency display:', error);
      return '$ USD';
    }
  }

  unlockedAchievements(): number {
    return this.gameService.gameState().achievements.filter(a => a.unlocked).length;
  }

  totalAchievements(): number {
    return this.gameService.gameState().achievements.length;
  }

  confirmClearInventory(): void {
    this.resetType.set('inventory');
    this.confirmTitle.set('Clear All Inventory?');
    this.confirmMessage.set('This will remove all items from your store, but keep your level, coins, and achievements.');
    this.confirmIcon.set('🗑️');
    this.showConfirmModal.set(true);
    this.soundService.playSound('click');
  }

  confirmResetProgress(): void {
    this.resetType.set('progress');
    this.confirmTitle.set('Reset Game Progress?');
    this.confirmMessage.set('This will reset your level, coins, score, and achievements back to the beginning, but keep your inventory items.');
    this.confirmIcon.set('🔄');
    this.showConfirmModal.set(true);
    this.soundService.playSound('click');
  }

  confirmResetEverything(): void {
    this.resetType.set('everything');
    this.confirmTitle.set('Reset EVERYTHING?');
    this.confirmMessage.set('This will completely reset the game like you never played before.');
    this.confirmIcon.set('💥');
    this.showConfirmModal.set(true);
    this.soundService.playSound('error');
  }

  cancelReset(): void {
    this.showConfirmModal.set(false);
    this.soundService.playSound('click');
  }

  confirmReset(): void {
    const type = this.resetType();

    switch (type) {
      case 'inventory':
        this.clearInventory();
        this.successMessage.set('All inventory items have been removed!');
        break;
      case 'progress':
        this.resetProgress();
        this.successMessage.set('Your game progress has been reset!');
        break;
      case 'everything':
        this.resetEverything();
        this.successMessage.set('Everything has been reset! Welcome back!');
        break;
    }

    this.showConfirmModal.set(false);
    this.showSuccessModal.set(true);
    this.soundService.playSound('success');
  }

  private clearInventory(): void {
    // Clear inventory from localStorage
    localStorage.removeItem('inventory_items');
    // Force reload to update the inventory service
    window.location.reload();
  }

  private resetProgress(): void {
    // Clear game state
    localStorage.removeItem('kids_game_state');
    localStorage.removeItem('kids_current_theme');
    localStorage.removeItem('total_scans');
    localStorage.removeItem('total_items_added');
    localStorage.removeItem('total_sales');
    // Force reload
    window.location.reload();
  }

  private resetEverything(): void {
    // Clear everything
    localStorage.clear();
    // Force reload
    window.location.reload();
  }

  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.showModal = false;
  }
}

