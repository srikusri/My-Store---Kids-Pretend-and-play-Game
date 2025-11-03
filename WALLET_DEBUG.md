# 🔍 Wallet Feature Debugging Guide

## Issue: Wallet Not Showing Up

### Quick Debugging Steps

#### 1. Check the Debug Panel
Visit **http://localhost:8080** and look at the **top-right corner** of the page. You should see a black debug panel showing:
- `hasPersona`: true/false
- `persona`: JSON data or null
- `balance`: Current balance

#### 2. Understand the Flow

The wallet will ONLY show when:
1. A persona has been selected (Seller or Buyer)
2. The persona data is saved in localStorage
3. The WalletService detects the persona

#### 3. Common Scenarios

**Scenario A: First Time User**
- ✅ Expected: Persona selection modal appears
- ✅ Expected: Debug panel shows `hasPersona: false`
- ❌ If modal doesn't appear: Check browser console for errors

**Scenario B: After Selecting Persona**
- ✅ Expected: Modal disappears
- ✅ Expected: Debug panel shows `hasPersona: true`
- ✅ Expected: Wallet button appears in header (💰 $X.XX)
- ❌ If wallet doesn't appear: Check debug panel values

**Scenario C: Returning User**
- ✅ Expected: No modal (persona remembered)
- ✅ Expected: Wallet immediately visible
- ❌ If modal appears again: localStorage might be cleared

### Manual Testing Steps

#### Test 1: Create a Seller Persona
1. Open browser console (F12)
2. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
3. Refresh page
4. Persona selection modal should appear
5. Select "I'm a Seller"
6. Enter name: "Test Seller"
7. Click "Start Playing as Seller"
8. Check debug panel: `hasPersona: true`, `balance: 0`
9. Look for wallet button in header (💰 $0.00)

#### Test 2: Create a Buyer Persona
1. Clear localStorage again
2. Refresh page
3. Select "I'm a Buyer"
4. Enter name: "Test Buyer"
5. Click "Start Playing as Buyer"
6. Check debug panel: `hasPersona: true`, `balance: 100`
7. Look for wallet button in header (💰 $100.00)

#### Test 3: Check LocalStorage Directly
1. Open browser console
2. Run:
   ```javascript
   JSON.parse(localStorage.getItem('kids_wallet_persona'))
   ```
3. Should see persona object with:
   - `id`: timestamp string
   - `type`: "seller" or "buyer"
   - `name`: entered name
   - `wallet`: { balance, transactions }
   - `createdAt`: ISO date string

#### Test 4: Use Test Page
1. Open **http://localhost:8080/test-wallet.html**
2. Click "Check Persona" to see current state
3. Click "Create Seller Persona" or "Create Buyer Persona"
4. Click "Load $50" to add money
5. Click "Check Balance" to verify
6. Click "Open Main App" to return to app
7. Wallet should now be visible

### Troubleshooting

#### Issue: Debug panel shows `hasPersona: false` after selecting persona

**Possible Causes:**
1. Persona not saved to localStorage
2. WalletService not loading persona on init
3. Error in persona creation

**Solution:**
1. Open console, check for errors
2. Manually check localStorage:
   ```javascript
   localStorage.getItem('kids_wallet_persona')
   ```
3. If null, persona wasn't saved. Try creating manually:
   ```javascript
   localStorage.setItem('kids_wallet_persona', JSON.stringify({
     id: Date.now().toString(),
     type: 'seller',
     name: 'Debug Seller',
     wallet: { balance: 0, transactions: [] },
     createdAt: new Date().toISOString()
   }))
   ```
4. Refresh page

#### Issue: Persona selection modal doesn't appear

**Possible Causes:**
1. Existing persona in localStorage
2. Component not loaded
3. CSS hiding modal

**Solution:**
1. Clear localStorage and refresh
2. Check console for component errors
3. Look for modal in DOM inspector

#### Issue: Wallet button exists but is invisible

**Possible Causes:**
1. CSS styling issue
2. Z-index conflict
3. Parent container hidden

**Solution:**
1. Open browser inspector (F12)
2. Search for `wallet-button` in Elements tab
3. Check computed styles
4. Look for `display: none` or `visibility: hidden`
5. Check if parent has proper dimensions

#### Issue: Clicking wallet button does nothing

**Possible Causes:**
1. Modal not opening
2. Event handler not attached
3. JavaScript error

**Solution:**
1. Check console for errors
2. Add breakpoint in wallet-display component
3. Verify showModal signal changes

### Browser Console Commands

#### Check Wallet Service State
```javascript
// In console, this won't work directly since it's Angular.
// But you can check localStorage:
localStorage.getItem('kids_wallet_persona')
```

#### Force Create Seller
```javascript
localStorage.setItem('kids_wallet_persona', JSON.stringify({
  id: Date.now().toString(),
  type: 'seller',
  name: 'Console Seller',
  wallet: {
    balance: 1000,
    transactions: [{
      id: Date.now().toString(),
      type: 'load',
      amount: 1000,
      description: 'Initial balance',
      timestamp: new Date().toISOString()
    }]
  },
  createdAt: new Date().toISOString()
}))
location.reload()
```

#### Force Create Buyer
```javascript
localStorage.setItem('kids_wallet_persona', JSON.stringify({
  id: Date.now().toString(),
  type: 'buyer',
  name: 'Console Buyer',
  wallet: {
    balance: 100,
    transactions: [{
      id: Date.now().toString(),
      type: 'load',
      amount: 100,
      description: 'Welcome bonus',
      timestamp: new Date().toISOString()
    }]
  },
  createdAt: new Date().toISOString()
}))
location.reload()
```

#### Clear Everything and Start Fresh
```javascript
localStorage.clear()
location.reload()
```

### Expected Behavior

#### Seller View
- Wallet starts at $0
- Navigation shows: Add Items, Sell Items, Sales History, Achievements
- Can add inventory items
- Can sell items
- After sale completion, shows QR code for payment
- Wallet increases when buyer scans and pays

#### Buyer View
- Wallet starts at $100
- Navigation shows: Scan to Pay, Achievements
- Main view shows:
  - Welcome message
  - Wallet balance card
  - Total purchases count
  - "Scan QR Code to Pay" button
- Click button opens camera scanner
- Scan seller's QR code to complete payment

### Still Not Working?

#### Check Build Output
Look at terminal where `npm start` is running. Check for:
- Compilation errors
- Missing modules
- TypeScript errors

#### Check Network Tab
1. Open DevTools → Network tab
2. Refresh page
3. Look for failed requests (red)
4. Check if all component files load

#### Check Angular DevTools
1. Install Angular DevTools extension
2. Open DevTools → Angular tab
3. Inspect component tree
4. Check if WalletDisplayComponent is present
5. Check component inputs/outputs

#### Last Resort: Clean Rebuild
```bash
# Stop the server (Ctrl+C)
rm -rf node_modules package-lock.json dist .angular
npm install
npm start
```

### Contact Info

If issue persists, provide:
1. Screenshot of debug panel
2. Console errors (if any)
3. localStorage contents
4. Browser and version
5. Steps taken so far

---

**Remember:** The debug panel (top-right corner) is your friend! It shows exactly what the app thinks about the persona state.

