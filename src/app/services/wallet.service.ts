import { Injectable, signal, computed } from '@angular/core';
import { Persona, PersonaType, Wallet, WalletTransaction, PaymentRequest } from '../models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly PERSONA_KEY = 'kids_wallet_persona';
  private readonly PAYMENT_REQUEST_KEY = 'kids_payment_request';
  
  private personaSignal = signal<Persona | null>(null);
  
  persona = this.personaSignal.asReadonly();
  hasPersona = computed(() => this.personaSignal() !== null);
  balance = computed(() => this.personaSignal()?.wallet.balance || 0);
  transactions = computed(() => this.personaSignal()?.wallet.transactions || []);
  
  constructor() {
    this.loadPersona();
  }

  private loadPersona(): void {
    const saved = localStorage.getItem(this.PERSONA_KEY);
    if (saved) {
      try {
        const persona = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        persona.createdAt = new Date(persona.createdAt);
        persona.wallet.transactions = persona.wallet.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
        this.personaSignal.set(persona);
      } catch (error) {
        console.error('Error loading persona:', error);
      }
    }
  }

  private savePersona(): void {
    const persona = this.personaSignal();
    if (persona) {
      localStorage.setItem(this.PERSONA_KEY, JSON.stringify(persona));
    }
  }

  createPersona(type: PersonaType, name: string): Persona {
    const persona: Persona = {
      id: this.generateId(),
      type,
      name,
      wallet: {
        balance: type === PersonaType.BUYER ? 100 : 0, // Buyers start with $100
        transactions: []
      },
      createdAt: new Date()
    };
    
    if (type === PersonaType.BUYER) {
      // Add initial credit transaction
      persona.wallet.transactions.push({
        id: this.generateId(),
        type: 'load',
        amount: 100,
        description: 'Welcome bonus',
        timestamp: new Date()
      });
    }
    
    this.personaSignal.set(persona);
    this.savePersona();
    return persona;
  }

  switchPersona(): void {
    this.personaSignal.set(null);
    localStorage.removeItem(this.PERSONA_KEY);
    localStorage.removeItem(this.PAYMENT_REQUEST_KEY);
  }

  loadMoney(amount: number): boolean {
    const persona = this.personaSignal();
    if (!persona || amount <= 0) return false;

    const transaction: WalletTransaction = {
      id: this.generateId(),
      type: 'load',
      amount,
      description: 'Money loaded to wallet',
      timestamp: new Date()
    };

    persona.wallet.balance += amount;
    persona.wallet.transactions.unshift(transaction);
    
    this.personaSignal.set({ ...persona });
    this.savePersona();
    return true;
  }

  // Seller creates a payment request and stores it
  createPaymentRequest(amount: number, saleId: string): PaymentRequest {
    const persona = this.personaSignal();
    if (!persona) throw new Error('No persona selected');

    const request: PaymentRequest = {
      requestId: this.generateId(),
      sellerId: persona.id,
      sellerName: persona.name,
      amount,
      saleId,
      timestamp: new Date(),
      status: 'pending'
    };

    localStorage.setItem(this.PAYMENT_REQUEST_KEY, JSON.stringify(request));
    return request;
  }

  // Get current payment request
  getPaymentRequest(): PaymentRequest | null {
    const saved = localStorage.getItem(this.PAYMENT_REQUEST_KEY);
    if (saved) {
      try {
        const request = JSON.parse(saved);
        request.timestamp = new Date(request.timestamp);
        return request;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Buyer scans and pays
  processPayment(paymentRequest: PaymentRequest): boolean {
    const buyerPersona = this.personaSignal();
    if (!buyerPersona || buyerPersona.type !== PersonaType.BUYER) return false;
    if (buyerPersona.wallet.balance < paymentRequest.amount) return false;

    // Deduct from buyer
    buyerPersona.wallet.balance -= paymentRequest.amount;
    buyerPersona.wallet.transactions.unshift({
      id: this.generateId(),
      type: 'debit',
      amount: paymentRequest.amount,
      description: `Payment to ${paymentRequest.sellerName}`,
      timestamp: new Date(),
      toPersona: paymentRequest.sellerId
    });

    this.personaSignal.set({ ...buyerPersona });
    this.savePersona();

    // Update payment request status
    paymentRequest.status = 'completed';
    localStorage.setItem(this.PAYMENT_REQUEST_KEY, JSON.stringify(paymentRequest));

    return true;
  }

  // Seller checks if payment was completed and updates their wallet
  checkAndCompletePayment(): { success: boolean; amount?: number } {
    const sellerPersona = this.personaSignal();
    if (!sellerPersona || sellerPersona.type !== PersonaType.SELLER) {
      return { success: false };
    }

    const request = this.getPaymentRequest();
    if (!request || request.status !== 'completed' || request.sellerId !== sellerPersona.id) {
      return { success: false };
    }

    // Credit to seller
    sellerPersona.wallet.balance += request.amount;
    sellerPersona.wallet.transactions.unshift({
      id: this.generateId(),
      type: 'credit',
      amount: request.amount,
      description: `Payment received for sale`,
      timestamp: new Date(),
      fromPersona: 'buyer'
    });

    this.personaSignal.set({ ...sellerPersona });
    this.savePersona();

    // Clear payment request
    localStorage.removeItem(this.PAYMENT_REQUEST_KEY);

    return { success: true, amount: request.amount };
  }

  clearPaymentRequest(): void {
    localStorage.removeItem(this.PAYMENT_REQUEST_KEY);
  }

  // Manual payment confirmation - directly credit seller's wallet
  confirmManualPayment(amount: number): boolean {
    const sellerPersona = this.personaSignal();
    if (!sellerPersona || sellerPersona.type !== PersonaType.SELLER) {
      return false;
    }

    // Credit to seller
    sellerPersona.wallet.balance += amount;
    sellerPersona.wallet.transactions.unshift({
      id: this.generateId(),
      type: 'credit',
      amount: amount,
      description: `Payment received (manual confirmation)`,
      timestamp: new Date()
    });

    this.personaSignal.set({ ...sellerPersona });
    this.savePersona();

    // Clear payment request
    this.clearPaymentRequest();

    return true;
  }

  getTransactionHistory(limit?: number): WalletTransaction[] {
    const transactions = this.transactions();
    return limit ? transactions.slice(0, limit) : transactions;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
