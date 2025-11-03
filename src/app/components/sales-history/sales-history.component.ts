import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesHistoryService } from '../../services/sales-history.service';
import { Sale } from '../../models/inventory-item.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <button class="btn btn-success history-btn" (click)="showModal.set(true)">
      <span class="btn-icon">📊</span>
      <span class="btn-text">Sales History</span>
    </button>

    @if (showModal()) {
      <div class="modal-overlay" (click)="showModal.set(false)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>📊 Sales History</h2>
            <button class="close-button" (click)="showModal.set(false)">&times;</button>
          </div>
          
          <div class="modal-body">
            <!-- Summary Cards -->
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-icon">💰</div>
                <div class="summary-info">
                  <div class="summary-label">Total Sales</div>
                  <div class="summary-value">{{ salesHistoryService.getTotalSales() | currencyFormat }}</div>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon">📦</div>
                <div class="summary-info">
                  <div class="summary-label">Transactions</div>
                  <div class="summary-value">{{ salesHistoryService.getTotalTransactions() }}</div>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon">📅</div>
                <div class="summary-info">
                  <div class="summary-label">Today</div>
                  <div class="summary-value">{{ todaySalesTotal() | currencyFormat }}</div>
                </div>
              </div>
              
              <div class="summary-card">
                <div class="summary-icon">📈</div>
                <div class="summary-info">
                  <div class="summary-label">This Week</div>
                  <div class="summary-value">{{ weekSalesTotal() | currencyFormat }}</div>
                </div>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs">
              <button 
                [class]="'filter-tab ' + (activeFilter() === 'all' ? 'active' : '')"
                (click)="activeFilter.set('all')">
                All Time
              </button>
              <button 
                [class]="'filter-tab ' + (activeFilter() === 'today' ? 'active' : '')"
                (click)="activeFilter.set('today')">
                Today
              </button>
              <button 
                [class]="'filter-tab ' + (activeFilter() === 'week' ? 'active' : '')"
                (click)="activeFilter.set('week')">
                This Week
              </button>
              <button 
                [class]="'filter-tab ' + (activeFilter() === 'month' ? 'active' : '')"
                (click)="activeFilter.set('month')">
                This Month
              </button>
            </div>

            <!-- Sales List -->
            <div class="sales-list">
              @if (filteredSales().length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">📭</div>
                  <h3>No Sales Yet</h3>
                  <p>Start selling items to see them here!</p>
                </div>
              } @else {
                @for (sale of filteredSales(); track sale.id) {
                  <div class="sale-card">
                    <div class="sale-header">
                      <div class="sale-id">
                        <span class="sale-icon">🧾</span>
                        <span class="sale-number">#{{ sale.id.slice(-6).toUpperCase() }}</span>
                      </div>
                      <div class="sale-date">
                        {{ formatDate(sale.timestamp) }}
                      </div>
                    </div>
                    
                    <div class="sale-items">
                      @for (item of sale.items; track item.item.barcode) {
                        <div class="sale-item-row">
                          <span class="item-name">{{ item.item.name }}</span>
                          <span class="item-qty">x{{ item.quantity }}</span>
                          <span class="item-price">{{ (item.item.price * item.quantity) | currencyFormat }}</span>
                        </div>
                      }
                    </div>
                    
                    <div class="sale-footer">
                      <div class="sale-total">
                        <strong>Total:</strong>
                        <strong class="total-amount">{{ sale.total | currencyFormat }}</strong>
                      </div>
                      <button 
                        class="btn btn-danger btn-small delete-btn"
                        (click)="confirmDelete(sale)">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          @if (salesHistoryService.getTotalTransactions() > 0) {
            <div class="modal-footer">
              <button 
                class="btn btn-danger"
                (click)="confirmClearHistory()">
                🗑️ Clear All History
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- Confirmation Modal -->
    @if (showConfirmModal()) {
      <div class="modal-overlay confirm-overlay" (click)="cancelDelete()">
        <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-header warning-header">
            <h2>⚠️ Confirm Delete</h2>
          </div>
          
          <div class="modal-body">
            <div class="confirm-content">
              <div class="warning-icon">🗑️</div>
              <h3>{{ confirmMessage() }}</h3>
              <p>This action cannot be undone!</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">
              Cancel
            </button>
            <button class="btn btn-danger" (click)="confirmAction()">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .history-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
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
      max-width: 900px;
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
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      color: white;
      border-radius: 20px 20px 0 0;
    }

    .warning-header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
      padding: 1.5rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-icon {
      font-size: 2.5rem;
    }

    .summary-info {
      flex: 1;
    }

    .summary-label {
      font-size: 0.875rem;
      opacity: 0.9;
      margin-bottom: 0.25rem;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 0.625rem 1.25rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-tab:hover {
      border-color: #667eea;
      background: #f5f7ff;
    }

    .filter-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }

    .sales-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 500px;
      overflow-y: auto;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .sale-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.25rem;
      border: 2px solid #e0e0e0;
      transition: all 0.2s;
    }

    .sale-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    .sale-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .sale-id {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .sale-icon {
      font-size: 1.25rem;
    }

    .sale-number {
      font-family: 'Courier New', monospace;
      font-size: 0.938rem;
    }

    .sale-date {
      color: #666;
      font-size: 0.875rem;
    }

    .sale-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .sale-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: white;
      border-radius: 6px;
      font-size: 0.938rem;
    }

    .item-name {
      flex: 1;
      font-weight: 500;
      color: #333;
    }

    .item-qty {
      color: #666;
      margin: 0 1rem;
    }

    .item-price {
      font-weight: 600;
      color: #56ab2f;
    }

    .sale-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 2px solid #e0e0e0;
    }

    .sale-total {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.125rem;
    }

    .total-amount {
      color: #56ab2f;
      font-size: 1.375rem;
    }

    .delete-btn {
      padding: 0.5rem 1rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 2px solid #f0f0f0;
    }

    .confirm-content {
      text-align: center;
      padding: 2rem 1rem;
    }

    .warning-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .confirm-content h3 {
      font-size: 1.5rem;
      margin: 1rem 0;
      color: #333;
    }

    .confirm-content p {
      font-size: 1.125rem;
      color: #666;
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

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }

      .modal-body {
        padding: 1rem;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .summary-card {
        padding: 1rem;
      }

      .summary-icon {
        font-size: 2rem;
      }

      .summary-value {
        font-size: 1.25rem;
      }

      .filter-tabs {
        gap: 0.375rem;
      }

      .filter-tab {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      .sale-item-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .item-qty, .item-price {
        margin: 0;
      }

      .sale-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .delete-btn {
        width: 100%;
      }

      .modal-footer {
        flex-direction: column;
      }

      .modal-footer button {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesHistoryComponent {
  showModal = signal(false);
  activeFilter = signal<'all' | 'today' | 'week' | 'month'>('all');
  showConfirmModal = signal(false);
  confirmMessage = signal('');
  pendingAction = signal<(() => void) | null>(null);

  constructor(public salesHistoryService: SalesHistoryService) {}

  filteredSales = computed(() => {
    switch (this.activeFilter()) {
      case 'today':
        return this.salesHistoryService.getSalesToday();
      case 'week':
        return this.salesHistoryService.getSalesThisWeek();
      case 'month':
        return this.salesHistoryService.getSalesThisMonth();
      default:
        return this.salesHistoryService.salesHistory();
    }
  });

  todaySalesTotal = computed(() => {
    return this.salesHistoryService.getSalesToday()
      .reduce((sum, sale) => sum + sale.total, 0);
  });

  weekSalesTotal = computed(() => {
    return this.salesHistoryService.getSalesThisWeek()
      .reduce((sum, sale) => sum + sale.total, 0);
  });

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }

  confirmDelete(sale: Sale): void {
    this.confirmMessage.set(`Delete sale #${sale.id.slice(-6).toUpperCase()}?`);
    this.pendingAction.set(() => {
      this.salesHistoryService.deleteSale(sale.id);
      this.showConfirmModal.set(false);
    });
    this.showConfirmModal.set(true);
  }

  confirmClearHistory(): void {
    this.confirmMessage.set('Clear all sales history?');
    this.pendingAction.set(() => {
      this.salesHistoryService.clearHistory();
      this.showConfirmModal.set(false);
      this.showModal.set(false);
    });
    this.showConfirmModal.set(true);
  }

  confirmAction(): void {
    const action = this.pendingAction();
    if (action) {
      action();
    }
  }

  cancelDelete(): void {
    this.showConfirmModal.set(false);
    this.pendingAction.set(null);
  }
}

