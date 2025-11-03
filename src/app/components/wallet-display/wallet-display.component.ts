import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../services/wallet.service';
import { PersonaType } from '../../models/wallet.model';

@Component({
  selector: 'app-wallet-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wallet-container">
      <button class="wallet-button" (click)="showModal.set(true)">
        <span class="wallet-icon">💰</span>
        <span class="wallet-balance">\${{ walletService.balance().toFixed(2) }}</span>
      </button>

        @if (showModal()) {
          <div class="modal-overlay" (click)="showModal.set(false)">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>💰 My Wallet</h2>
                <button class="close-button" (click)="showModal.set(false)">&times;</button>
              </div>

              <div class="modal-body">
                <!-- Balance Card -->
                <div class="balance-card">
                  <div class="balance-label">Current Balance</div>
                  <div class="balance-amount">\${{ walletService.balance().toFixed(2) }}</div>
                  <div class="persona-badge" [class.seller]="isSeller()" [class.buyer]="isBuyer()">
                    {{ isSeller() ? '🏪 Seller' : '🛍️ Buyer' }}
                  </div>
                </div>

                <!-- Load Money -->
                <div class="load-money-section">
                  <h3>💵 Add Money to Wallet</h3>
                  <div class="quick-amounts">
                    <button class="amount-btn" (click)="loadQuickAmount(10)">+\$10</button>
                    <button class="amount-btn" (click)="loadQuickAmount(20)">+\$20</button>
                    <button class="amount-btn" (click)="loadQuickAmount(50)">+\$50</button>
                    <button class="amount-btn" (click)="loadQuickAmount(100)">+\$100</button>
                  </div>
                  
                  <div class="custom-amount">
                    <input 
                      type="number" 
                      [(ngModel)]="customAmount"
                      placeholder="Custom amount"
                      min="1"
                      class="amount-input">
                    <button 
                      class="btn btn-success"
                      (click)="loadCustomAmount()"
                      [disabled]="!customAmount() || customAmount() <= 0">
                      Load Money
                    </button>
                  </div>
                </div>

                <!-- Transaction History -->
                <div class="transaction-section">
                  <h3>📋 Recent Transactions</h3>
                  <div class="transaction-list">
                    @if (walletService.transactions().length === 0) {
                      <div class="empty-transactions">
                        <div class="empty-icon">📭</div>
                        <p>No transactions yet</p>
                      </div>
                    } @else {
                      @for (transaction of walletService.transactions().slice(0, 10); track transaction.id) {
                        <div class="transaction-item" [class.credit]="transaction.type === 'credit' || transaction.type === 'load'"
                             [class.debit]="transaction.type === 'debit'">
                          <div class="transaction-icon">
                            {{ transaction.type === 'credit' || transaction.type === 'load' ? '💰' : '💸' }}
                          </div>
                          <div class="transaction-details">
                            <div class="transaction-desc">{{ transaction.description }}</div>
                            <div class="transaction-date">{{ formatDate(transaction.timestamp) }}</div>
                          </div>
                          <div class="transaction-amount" [class.positive]="transaction.type === 'credit' || transaction.type === 'load'"
                               [class.negative]="transaction.type === 'debit'">
                            {{ transaction.type === 'debit' ? '-' : '+' }}\${{ transaction.amount.toFixed(2) }}
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="switchPersona()">
                  🔄 Switch Persona
                </button>
              </div>
            </div>
          </div>
        }
    </div>
  `,
  styles: [`
    .wallet-container {
      position: relative;
    }

    .wallet-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      font-weight: 700;
    }

    .wallet-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .wallet-icon {
      font-size: 1.25rem;
    }

    .wallet-balance {
      font-size: 1.125rem;
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
      z-index: 2000;
      animation: fadeIn 0.2s;
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

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: white;
      border-radius: 20px 20px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.75rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 2rem;
      color: white;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 1.5rem;
    }

    .balance-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      color: white;
      margin-bottom: 2rem;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .balance-label {
      font-size: 1rem;
      opacity: 0.9;
      margin-bottom: 0.5rem;
    }

    .balance-amount {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }

    .persona-badge {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      border-radius: 24px;
      font-weight: 600;
      font-size: 0.938rem;
    }

    .persona-badge.seller {
      background: rgba(255, 255, 255, 0.3);
    }

    .persona-badge.buyer {
      background: rgba(255, 255, 255, 0.3);
    }

    .load-money-section {
      margin-bottom: 2rem;
    }

    .load-money-section h3 {
      font-size: 1.25rem;
      margin: 0 0 1rem 0;
      color: #333;
    }

    .quick-amounts {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .amount-btn {
      padding: 0.875rem;
      border: 2px solid #56ab2f;
      background: white;
      color: #56ab2f;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .amount-btn:hover {
      background: #56ab2f;
      color: white;
      transform: scale(1.05);
    }

    .custom-amount {
      display: flex;
      gap: 0.75rem;
    }

    .amount-input {
      flex: 1;
      padding: 0.875rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .amount-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .transaction-section h3 {
      font-size: 1.25rem;
      margin: 0 0 1rem 0;
      color: #333;
    }

    .transaction-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .empty-transactions {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #ccc;
    }

    .transaction-item.credit {
      border-left-color: #56ab2f;
    }

    .transaction-item.debit {
      border-left-color: #ff6b6b;
    }

    .transaction-icon {
      font-size: 1.5rem;
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-desc {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .transaction-date {
      font-size: 0.875rem;
      color: #999;
    }

    .transaction-amount {
      font-size: 1.125rem;
      font-weight: 700;
    }

    .transaction-amount.positive {
      color: #56ab2f;
    }

    .transaction-amount.negative {
      color: #ff6b6b;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 2px solid #f0f0f0;
      text-align: center;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .wallet-button {
        padding: 0.5rem 1rem;
      }

      .wallet-balance {
        font-size: 1rem;
      }

      .balance-amount {
        font-size: 2.5rem;
      }

      .quick-amounts {
        grid-template-columns: repeat(2, 1fr);
      }

      .custom-amount {
        flex-direction: column;
      }

      .custom-amount .btn {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletDisplayComponent {
  showModal = signal(false);
  customAmount = signal<number | null>(null);

  constructor(public walletService: WalletService) {}

  isSeller(): boolean {
    return this.walletService.persona()?.type === PersonaType.SELLER;
  }

  isBuyer(): boolean {
    return this.walletService.persona()?.type === PersonaType.BUYER;
  }

  loadQuickAmount(amount: number): void {
    if (this.walletService.loadMoney(amount)) {
      this.customAmount.set(null);
    }
  }

  loadCustomAmount(): void {
    const amount = this.customAmount();
    if (amount && amount > 0) {
      if (this.walletService.loadMoney(amount)) {
        this.customAmount.set(null);
      }
    }
  }

  switchPersona(): void {
    if (confirm('Are you sure you want to switch persona? Your current wallet data will be cleared.')) {
      this.walletService.switchPersona();
      this.showModal.set(false);
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return d.toLocaleDateString();
  }
}

