import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { CartService } from '../../services/cart.service';
import { InventoryService } from '../../services/inventory.service';
import { GameService } from '../../services/game.service';
import { SoundService } from '../../services/sound.service';
import { ToastService } from '../../services/toast.service';
import { WalletService } from '../../services/wallet.service';
import { ToastComponent } from '../toast/toast.component';
import { QrPaymentComponent } from '../qr-payment/qr-payment.component';
import { Sale } from '../../models/inventory-item.model';
import { PersonaType } from '../../models/wallet.model';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZXingScannerModule,
    ToastComponent,
    QrPaymentComponent
  ],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesComponent {
  scanning = signal(false);
  showCheckoutModal = signal(false);
  showQRPayment = signal(false);
  completedSale = signal<Sale | null>(null);
  scanQuantity = signal(1);
  pendingSaleId = signal<string>('');
  singleScanMode = signal(true); // Default to single scan mode

  // Barcode formats to scan
  barcodeFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E
  ];

  constructor(
    public cartService: CartService,
    public inventoryService: InventoryService,
    private toastService: ToastService,
    private gameService: GameService,
    private soundService: SoundService,
    public walletService: WalletService
  ) {}

  startScanning(): void {
    this.scanning.set(true);
  }

  stopScanning(): void {
    this.scanning.set(false);
  }

  onScanSuccess(barcode: string): void {
    const item = this.inventoryService.getItemByBarcode(barcode);
    
    this.gameService.onItemScanned();
    this.soundService.playSound('scan');

    if (!item) {
      this.soundService.playSound('error');
      this.showToast('😕 Oops! Item not in your store!', 'error');
      return;
    }

    if (item.quantity === 0) {
      this.soundService.playSound('error');
      this.showToast('😔 Oh no! Out of stock!', 'error');
      return;
    }

    // Use 1 in single scan mode, or the set quantity in quantity mode
    const quantityToAdd = this.singleScanMode() ? 1 : this.scanQuantity();
    const success = this.cartService.addToCart(item, quantityToAdd);

    if (success) {
      this.soundService.playSound('success');
      this.soundService.playCoinSound();
      const qtyText = this.singleScanMode() ? '' : ` (x${quantityToAdd})`;
      this.showToast(`🛒 ${item.name}${qtyText} added to cart!`, 'success');
    } else {
      this.soundService.playSound('error');
      this.showToast('😬 Not enough in stock!', 'error');
    }
  }

  toggleScanMode(): void {
    this.singleScanMode.set(!this.singleScanMode());
    const mode = this.singleScanMode() ? 'Single Scan' : 'Quantity Mode';
    this.showToast(`📱 Switched to ${mode}`, 'info');
  }

  onScanError(error: Error): void {
    console.error('Scan error:', error);
  }

  manualBarcodeEntry(): void {
    const barcode = prompt('Enter barcode manually:');
    if (barcode) {
      this.onScanSuccess(barcode);
    }
  }

  updateQuantity(barcode: string, quantity: number): void {
    const success = this.cartService.updateCartItemQuantity(barcode, quantity);
    if (!success) {
      this.showToast('Invalid quantity or insufficient stock!', 'error');
    }
  }

  removeFromCart(barcode: string): void {
    this.cartService.removeFromCart(barcode);
    this.showToast('Item removed from cart', 'info');
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.cartService.clearCart();
      this.showToast('Cart cleared', 'info');
    }
  }

  proceedToCheckout(): void {
    if (this.cartService.cart().length === 0) {
      this.showToast('Cart is empty!', 'error');
      return;
    }
    this.showCheckoutModal.set(true);
  }

  finalizeSale(): void {
    // Check if seller persona is active
    const persona = this.walletService.persona();
    const isSeller = persona?.type === PersonaType.SELLER;
    
    if (isSeller) {
      // For sellers: Show QR code for payment
      const total = this.cartService.cartTotal();
      this.pendingSaleId.set(Date.now().toString());
      this.showQRPayment.set(true);
      this.showCheckoutModal.set(false);
    } else {
      // For non-wallet users or direct sale
      this.completeSaleWithoutPayment();
    }
  }

  onPaymentReceived(amount: number): void {
    // Complete the sale after payment received
    const sale = this.cartService.finalizeSale();
    
    if (sale) {
      this.completedSale.set(sale);
      this.gameService.onSaleCompleted(sale.total);
      this.soundService.playSound('levelUp');
      this.showToast(`🎉 Payment received! \$${amount.toFixed(2)} added to wallet!`, 'success');
      this.showQRPayment.set(false);
    } else {
      this.soundService.playSound('error');
      this.showToast('😕 Oops! Something went wrong!', 'error');
    }
  }

  onPaymentCancelled(): void {
    this.showQRPayment.set(false);
    this.showCheckoutModal.set(true);
    this.showToast('Payment cancelled', 'info');
  }

  private completeSaleWithoutPayment(): void {
    const sale = this.cartService.finalizeSale();

    if (sale) {
      this.completedSale.set(sale);
      this.gameService.onSaleCompleted(sale.total);
      this.soundService.playSound('levelUp');
      this.showToast('🎉 Amazing! Sale complete! You earned coins!', 'success');
    } else {
      this.soundService.playSound('error');
      this.showToast('😕 Oops! Something went wrong!', 'error');
    }
  }

  closeCheckoutModal(): void {
    this.showCheckoutModal.set(false);
  }

  startNewSale(): void {
    this.completedSale.set(null);
    this.closeCheckoutModal();
  }

  printReceipt(): void {
    window.print();
  }

  private showToast(message: string, severity: 'success' | 'info' | 'warn' | 'error'): void {
    this.toastService.add({
      severity,
      summary: severity === 'error' ? 'Error' : severity === 'success' ? 'Success' : 'Info',
      detail: message,
      life: 3000
    });
  }
}

