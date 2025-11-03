import { Component, Input, Output, EventEmitter, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../services/wallet.service';
import { PaymentRequest } from '../../models/wallet.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    @if (showQR()) {
      <div class="qr-overlay">
        <div class="qr-modal">
          <div class="qr-header">
            <h2>💳 Payment Request</h2>
          </div>

          <div class="qr-body">
            <div class="payment-amount">
              <div class="amount-label">Amount Due</div>
              <div class="amount-value">{{ amount() | currencyFormat }}</div>
            </div>

            <div class="qr-container">
              <canvas #qrCanvas class="qr-canvas"></canvas>
            </div>

            <div class="instructions">
              <div class="instruction-icon">📱</div>
              <p>Ask the buyer to scan this QR code with their device</p>
            </div>

            @if (!paymentComplete()) {
              <div class="confirm-payment-section">
                <button 
                  class="btn btn-success btn-large confirm-btn" 
                  (click)="confirmPayment()"
                  [disabled]="processing()"
                  [class.processing]="processing()">
                  @if (processing()) {
                    <span class="spinner-small"></span>
                    <span>Processing...</span>
                  } @else {
                    <span>✓ Confirm Payment Received</span>
                  }
                </button>
                <p class="confirm-note">Click after buyer completes payment</p>
              </div>
            }

            @if (paymentComplete()) {
              <div class="success-message">
                <div class="success-icon">✅</div>
                <h3>Payment Received!</h3>
                <p class="received-amount">{{ receivedAmount() | currencyFormat }}</p>
              </div>
            }
          </div>

          <div class="qr-footer">
            @if (!paymentComplete()) {
              <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
            } @else {
              <button class="btn btn-success btn-large" (click)="close()">
                🎉 Complete Sale
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .qr-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2500;
      animation: fadeIn 0.3s;
    }

    .qr-modal {
      background: white;
      border-radius: 24px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      animation: slideUp 0.4s;
    }

    .qr-header {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      padding: 1.5rem;
      border-radius: 24px 24px 0 0;
      text-align: center;
    }

    .qr-header h2 {
      margin: 0;
      color: white;
      font-size: 1.75rem;
    }

    .qr-body {
      padding: 2rem;
      text-align: center;
    }

    .payment-amount {
      margin-bottom: 2rem;
    }

    .amount-label {
      font-size: 1.125rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .amount-value {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .qr-container {
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: inline-block;
      margin-bottom: 2rem;
    }

    .qr-canvas {
      display: block;
      max-width: 280px;
      height: auto;
      border-radius: 8px;
    }

    .instructions {
      margin-bottom: 1.5rem;
    }

    .instruction-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      animation: pulse 2s infinite;
    }

    .instructions p {
      font-size: 1.125rem;
      color: #666;
      margin: 0;
    }

    .confirm-payment-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 16px;
      border: 2px dashed #56ab2f;
    }

    .confirm-btn {
      width: 100%;
      font-size: 1.25rem;
      padding: 1rem 2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      box-shadow: 0 4px 12px rgba(86, 171, 47, 0.3);
      transition: all 0.3s;
    }

    .confirm-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(86, 171, 47, 0.4);
    }

    .confirm-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .confirm-btn.processing {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .spinner-small {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .confirm-note {
      margin: 0;
      font-size: 0.938rem;
      color: #666;
      text-align: center;
      font-style: italic;
    }

    .success-message {
      padding: 2rem;
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      border-radius: 16px;
      color: white;
      margin-top: 1rem;
      animation: successPop 0.5s;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: bounce 0.6s;
    }

    .success-message h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
    }

    .received-amount {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
    }

    .qr-footer {
      padding: 1.5rem;
      border-top: 2px solid #f0f0f0;
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .qr-footer button {
      min-width: 150px;
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

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes successPop {
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

    @media (max-width: 768px) {
      .qr-modal {
        width: 95%;
      }

      .qr-body {
        padding: 1.5rem;
      }

      .amount-value {
        font-size: 2.5rem;
      }

      .qr-canvas {
        max-width: 240px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrPaymentComponent {
  @Input() set visible(value: boolean) {
    this.showQR.set(value);
  }

  @Input() set paymentAmount(value: number) {
    this.amount.set(value);
  }

  @Input() set saleId(value: string) {
    this._saleId = value;
  }

  @Output() paymentCompleted = new EventEmitter<number>();
  @Output() cancelled = new EventEmitter<void>();

  showQR = signal(false);
  amount = signal(0);
  paymentComplete = signal(false);
  receivedAmount = signal(0);
  processing = signal(false);

  private _saleId = '';

  constructor(private walletService: WalletService) {
    effect(() => {
      if (this.showQR()) {
        this.initializePayment();
      } else {
        this.cleanup();
      }
    });
  }

  private async initializePayment(): Promise<void> {
    // Create payment request
    const request = this.walletService.createPaymentRequest(this.amount(), this._saleId);
    
    // Generate QR code
    await this.generateQRCode(request);
    
    // Reset payment status
    this.paymentComplete.set(false);
    this.receivedAmount.set(0);
    this.processing.set(false);
  }

  private async generateQRCode(request: PaymentRequest): Promise<void> {
    const qrData = JSON.stringify({
      type: 'payment_request',
      requestId: request.requestId,
      sellerId: request.sellerId,
      sellerName: request.sellerName,
      amount: request.amount,
      saleId: request.saleId,
      timestamp: request.timestamp.toISOString()
    });

    try {
      // Wait for the canvas to be available
      setTimeout(async () => {
        const canvas = document.querySelector('.qr-canvas') as HTMLCanvasElement;
        if (canvas) {
          await QRCode.toCanvas(canvas, qrData, {
            width: 280,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  confirmPayment(): void {
    // Prevent double-click
    if (this.processing() || this.paymentComplete()) {
      return;
    }
    
    // Set processing to disable button
    this.processing.set(true);
    
    // Manual confirmation by seller - directly credit wallet
    const amount = this.amount();
    const success = this.walletService.confirmManualPayment(amount);
    
    if (success) {
      this.paymentComplete.set(true);
      this.receivedAmount.set(amount);
      
      // Close immediately with a small delay for UI feedback (500ms)
      setTimeout(() => {
        this.close();
      }, 500);
    } else {
      // If failed, reset processing so user can try again
      this.processing.set(false);
    }
  }

  cancel(): void {
    this.walletService.clearPaymentRequest();
    this.cancelled.emit();
    this.showQR.set(false);
  }

  close(): void {
    // Store amount before any cleanup can reset it
    const finalAmount = this.receivedAmount();
    this.showQR.set(false);
    // Emit after setting showQR to false to ensure cleanup doesn't interfere
    this.paymentCompleted.emit(finalAmount);
  }

  private cleanup(): void {
    // Reset payment status when closing
    this.paymentComplete.set(false);
    this.receivedAmount.set(0);
    this.processing.set(false);
  }
}

