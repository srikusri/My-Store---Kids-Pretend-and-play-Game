# 💳 Wallet Feature Implementation Plan

## Overview
Add a complete wallet system with persona selection (Seller/Buyer), QR code payments, and balance management.

## Components to Create

### 1. Persona Selection Component (`persona-selection.component.ts`)
- **Purpose**: Let users choose Seller or Buyer role on first launch
- **Features**:
  - Modal with two persona cards
  - Visual distinction between roles
  - One-time selection stored in localStorage
  - Ability to reset persona from settings

### 2. Wallet Component (`wallet.component.ts`)
- **Purpose**: Display and manage wallet balance
- **Features**:
  - Balance display with currency formatting
  - "Add Money" button to load funds
  - Transaction history
  - Quick amount buttons ($10, $20, $50, $100)
  - Custom amount input
  - Visual feedback for transactions

### 3. Payment QR Component (`payment-qr.component.ts`)
- **Purpose**: Handle QR code generation and scanning for payments
- **Features**:
  - **For Sellers**: Generate QR code with payment amount
  - **For Buyers**: Scan QR code to pay
  - Payment confirmation
  - Success/failure feedback
  - Integration with wallet service

## User Flows

### First-Time User Flow
```
1. App loads
2. Check if persona selected
3. If not, show Persona Selection Modal
4. User picks Seller or Buyer
5. Initialize wallet with $0 balance
6. Continue to app
```

### Seller Flow
```
1. Add items to inventory
2. Customer browses and adds to cart
3. Checkout initiated
4. System generates QR code with sale total
5. Display QR code to customer
6. Wait for payment scan
7. Payment received → Add to seller wallet
8. Complete sale
```

### Buyer Flow
```
1. Load money into wallet
2. Browse items (can be simulated or from seller's inventory)
3. At checkout, scan seller's QR code
4. Confirm payment amount
5. Deduct from buyer wallet
6. Payment sent
7. Receipt/confirmation shown
```

## Technical Implementation

### Models (`wallet.model.ts`) ✅ DONE
- `Persona` enum (SELLER, BUYER)
- `WalletTransaction` interface
- `Wallet` interface
- `PaymentRequest` interface

### Services (`wallet.service.ts`) ✅ DONE
- WalletService with signal-based state
- Methods: addMoney, deductMoney, creditMoney
- Transaction history management
- Payment request creation
- QR code data encoding/decoding

### Package Updates ✅ DONE
- Added `qrcode` package
- Added `@types/qrcode`
- npm install completed

## Integration Points

### 1. App Component
- Check persona on load
- Show persona selection if needed
- Add wallet button to header

### 2. Game Header
- Add wallet balance display
- Quick access to wallet modal

### 3. Sales Component  
- After checkout, show QR for seller
- Add scan option for buyer
- Handle payment flow

### 4. Settings Component
- Add "Reset Persona" option
- Add "Reset Wallet" option

## UI/UX Design

### Persona Cards
- **Seller Card**: 🏪 icon, purple gradient, "I want to sell items"
- **Buyer Card**: 🛒 icon, green gradient, "I want to buy items"

### Wallet Display
- Large balance number
- Recent transactions list
- Add money button prominent
- QR scan/generate buttons based on persona

### Payment QR
- Large, centered QR code
- Amount clearly displayed
- Timer showing QR expiry (optional)
- Cancel/Complete buttons

## Storage Keys
- `kids_persona` - Selected persona (seller/buyer)
- `kids_wallet` - Wallet data (balance, transactions)
- `kids_session_id` - Unique session identifier for QR codes

## Security Considerations
- Validate payment amounts
- Check sufficient balance before payment
- Transaction IDs for tracking
- No real money involved (educational purpose)

## Future Enhancements
- Multi-user support (connect multiple devices)
- Payment history filtering
- Export transactions
- Spending analytics
- Budget limits for buyers
- Sales reports for sellers

---

## Next Steps
1. Create persona-selection.component.ts
2. Create wallet.component.ts
3. Create payment-qr.component.ts
4. Integrate into app.component.ts
5. Update sales.component.ts for payment flow
6. Add wallet button to game-header
7. Test complete flow
8. Deploy to GitHub Pages

