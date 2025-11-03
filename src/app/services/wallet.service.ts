import { Injectable, signal, computed } from '@angular/core';
import { Persona, Wallet, WalletTransaction, PaymentRequest } from '../models/wallet.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly WALLET_KEY = 'kids_wallet';
  private readonly PERSONA_KEY = 'kids_persona';
  private readonly SESSION_ID_KEY = 'kids_session_id';
  
  private walletSignal = signal<Wallet>({
    persona: Persona.SELLER,
    balance: 0,
    transactions: []
  });
  
  wallet = this.walletSignal.asReadonly();
  balance = computed(() => this.walletSignal().balance);
  persona = computed(() => this.walletSignal().persona);
  transactions = computed(() => this.walletSignal().transactions);

  private sessionId: string;

  constructor(private storageService: StorageService) {
    this.sessionId = this.loadOrCreateSessionId();
    this.loadWallet();
  }

  private loadOrCreateSessionId(): string {
    let id = this.storageService.getItem(this.SESSION_ID_KEY);
    if (!id) {
      id = this.generateSessionId();
      this.storageService.setItem(this.SESSION_ID_KEY, id);
    }
    return id;
  }

  private generateSessionId(): string {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  hasPersona(): boolean {
    return !!this.storageService.getItem(this.PERSONA_KEY);
  }

  setPersona(persona: Persona): void {
    this.storageService.setItem(this.PERSONA_KEY, persona);
    const currentWallet = this.walletSignal();
    this.walletSignal.set({
      ...currentWallet,
      persona
    });
    this.saveWallet();
  }

  private loadWallet(): void {
    const savedPersona = this.storageService.getItem(this.PERSONA_KEY);
    const savedWallet = this.storageService.getItem(this.WALLET_KEY);
    
    if (savedWallet) {
      try {
        const wallet = JSON.parse(savedWallet);
        // Convert timestamp strings back to Date objects
        wallet.transactions = wallet.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        }));
        this.walletSignal.set(wallet);
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    }

    if (savedPersona) {
      const currentWallet = this.walletSignal();
      this.walletSignal.set({
        ...currentWallet,
        persona: savedPersona as Persona
      });
    }
  }

  private saveWallet(): void {
    this.storageService.setItem(this.WALLET_KEY, JSON.stringify(this.walletSignal()));
  }

  private generateTransactionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  addMoney(amount: number): void {
    if (amount <= 0) return;

    const currentWallet = this.walletSignal();
    const newBalance = currentWallet.balance + amount;

    const transaction: WalletTransaction = {
      id: this.generateTransactionId(),
      type: 'credit',
      amount,
      description: 'Added money to wallet',
      timestamp: new Date(),
      balanceAfter: newBalance
    };

    this.walletSignal.set({
      ...currentWallet,
      balance: newBalance,
      transactions: [transaction, ...currentWallet.transactions]
    });

    this.saveWallet();
  }

  deductMoney(amount: number, description: string = 'Payment'): boolean {
    const currentWallet = this.walletSignal();
    
    if (currentWallet.balance < amount) {
      return false; // Insufficient funds
    }

    const newBalance = currentWallet.balance - amount;

    const transaction: WalletTransaction = {
      id: this.generateTransactionId(),
      type: 'debit',
      amount,
      description,
      timestamp: new Date(),
      balanceAfter: newBalance
    };

    this.walletSignal.set({
      ...currentWallet,
      balance: newBalance,
      transactions: [transaction, ...currentWallet.transactions]
    });

    this.saveWallet();
    return true;
  }

  creditMoney(amount: number, description: string = 'Payment received'): void {
    const currentWallet = this.walletSignal();
    const newBalance = currentWallet.balance + amount;

    const transaction: WalletTransaction = {
      id: this.generateTransactionId(),
      type: 'credit',
      amount,
      description,
      timestamp: new Date(),
      balanceAfter: newBalance
    };

    this.walletSignal.set({
      ...currentWallet,
      balance: newBalance,
      transactions: [transaction, ...currentWallet.transactions]
    });

    this.saveWallet();
  }

  createPaymentRequest(amount: number, description: string): PaymentRequest {
    return {
      sellerId: this.sessionId,
      amount,
      timestamp: Date.now(),
      description
    };
  }

  processPayment(paymentRequest: PaymentRequest): { success: boolean; message: string } {
    // Buyer paying seller
    if (this.persona() !== Persona.BUYER) {
      return { success: false, message: 'Only buyers can make payments' };
    }

    const success = this.deductMoney(
      paymentRequest.amount,
      `Payment to seller: ${paymentRequest.description}`
    );

    if (success) {
      return {
        success: true,
        message: `Paid $${paymentRequest.amount.toFixed(2)} successfully!`
      };
    } else {
      return {
        success: false,
        message: 'Insufficient balance in wallet'
      };
    }
  }

  resetWallet(): void {
    this.walletSignal.set({
      persona: this.walletSignal().persona,
      balance: 0,
      transactions: []
    });
    this.saveWallet();
  }

  clearPersona(): void {
    this.storageService.removeItem(this.PERSONA_KEY);
    this.storageService.removeItem(this.WALLET_KEY);
    this.walletSignal.set({
      persona: Persona.SELLER,
      balance: 0,
      transactions: []
    });
  }
}

