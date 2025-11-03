export enum Persona {
  SELLER = 'seller',
  BUYER = 'buyer'
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  balanceAfter: number;
}

export interface Wallet {
  persona: Persona;
  balance: number;
  transactions: WalletTransaction[];
}

export interface PaymentRequest {
  sellerId: string;
  amount: number;
  timestamp: number;
  description: string;
}

