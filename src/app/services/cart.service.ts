import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, InventoryItem, Sale } from '../models/inventory-item.model';
import { StorageService } from './storage.service';
import { InventoryService } from './inventory.service';
import { SalesHistoryService } from './sales-history.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSignal = signal<CartItem[]>([]);
  
  cart = this.cartSignal.asReadonly();
  cartCount = computed(() => this.cartSignal().reduce((sum, item) => sum + item.quantity, 0));
  cartTotal = computed(() => 
    this.cartSignal().reduce((sum, item) => sum + (item.item.price * item.quantity), 0)
  );

  private salesHistoryService = inject(SalesHistoryService);

  constructor(
    private storageService: StorageService,
    private inventoryService: InventoryService
  ) {}

  addToCart(item: InventoryItem, quantity: number = 1): boolean {
    // Check if we have enough quantity in inventory
    if (item.quantity < quantity) {
      return false;
    }

    const existingCartItem = this.cartSignal().find(
      cartItem => cartItem.item.barcode === item.barcode
    );

    if (existingCartItem) {
      // Check total quantity
      if (item.quantity < existingCartItem.quantity + quantity) {
        return false;
      }

      const updatedCart = this.cartSignal().map(cartItem => {
        if (cartItem.item.barcode === item.barcode) {
          return {
            ...cartItem,
            quantity: cartItem.quantity + quantity
          };
        }
        return cartItem;
      });
      this.cartSignal.set(updatedCart);
    } else {
      this.cartSignal.set([...this.cartSignal(), { item, quantity }]);
    }

    return true;
  }

  updateCartItemQuantity(barcode: string, quantity: number): boolean {
    const cartItem = this.cartSignal().find(item => item.item.barcode === barcode);
    
    if (!cartItem || cartItem.item.quantity < quantity) {
      return false;
    }

    if (quantity === 0) {
      this.removeFromCart(barcode);
      return true;
    }

    const updatedCart = this.cartSignal().map(item => {
      if (item.item.barcode === barcode) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cartSignal.set(updatedCart);
    return true;
  }

  removeFromCart(barcode: string): void {
    const updatedCart = this.cartSignal().filter(
      item => item.item.barcode !== barcode
    );
    this.cartSignal.set(updatedCart);
  }

  clearCart(): void {
    this.cartSignal.set([]);
  }

  finalizeSale(): Sale | null {
    const cartItems = this.cartSignal();
    
    if (cartItems.length === 0) {
      return null;
    }

    // Update inventory quantities
    for (const cartItem of cartItems) {
      const success = this.inventoryService.decreaseQuantity(
        cartItem.item.barcode,
        cartItem.quantity
      );
      
      if (!success) {
        return null;
      }
    }

    // Create sale record
    const sale: Sale = {
      id: this.generateId(),
      items: cartItems,
      total: this.cartTotal(),
      timestamp: new Date()
    };

    // Save sale to history
    this.salesHistoryService.addSale(sale);

    // Clear cart
    this.clearCart();

    return sale;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

