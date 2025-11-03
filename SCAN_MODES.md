# 📱 Scan Modes Feature

## Overview
The Sales component now supports **two scanning modes** to provide flexibility when adding items to the cart:
1. **One at a Time Mode** (Default) - Scan items individually, each scan adds 1 item
2. **Quantity Mode** - Set a quantity, then scan once to add multiple items

---

## 🎯 Use Cases

### One at a Time Mode (1️⃣)
**Perfect for:**
- Quickly scanning multiple different items
- Retail checkout scenarios
- When customers have one of each item
- Fast-paced scanning without stopping to set quantities

**How it works:**
- Each scan adds exactly 1 item to cart
- Keep scanning continuously
- Different items? Just keep scanning!
- Fast and efficient for varied items

**Example:**
```
Scan: Apple → Cart: 1x Apple
Scan: Banana → Cart: 1x Apple, 1x Banana  
Scan: Apple → Cart: 2x Apple, 1x Banana
Scan: Orange → Cart: 2x Apple, 1x Banana, 1x Orange
```

### Quantity Mode (🔢)
**Perfect for:**
- Bulk purchases of the same item
- When customer buys multiple identical items
- Wholesale scenarios
- Reduces repetitive scanning

**How it works:**
- Set the quantity (e.g., 5)
- Scan the item once
- All 5 items added to cart automatically

**Example:**
```
Set Quantity: 5
Scan: Apple → Cart: 5x Apple

Set Quantity: 3
Scan: Banana → Cart: 5x Apple, 3x Banana
```

---

## 🎨 UI/UX

### Scan Mode Toggle Button
**One at a Time Mode (Active):**
- 🟢 Green gradient background
- 1️⃣ Icon
- Text: "One at a Time"
- Border: Green

**Quantity Mode (Active):**
- 🔵 Blue gradient background
- 🔢 Icon
- Text: "Quantity Mode"
- Border: Blue
- Shows quantity input field

### Layout
```
┌─────────────────────────────────┐
│  ⏹️ Stop Scanning               │
│  1️⃣ One at a Time     [Toggle]  │
│                                 │
│  [Scanner View]                 │
└─────────────────────────────────┘

When switched to Quantity Mode:

┌─────────────────────────────────┐
│  ⏹️ Stop Scanning               │
│  🔢 Quantity Mode      [Toggle]  │
│  Quantity per scan: [  5  ]     │
│                                 │
│  [Scanner View]                 │
└─────────────────────────────────┘
```

---

## 📱 Mobile Optimization

### Touch-Friendly
- Large toggle button (min 52px height)
- Full-width controls on mobile
- Clear visual feedback
- Easy thumb reach

### Responsive Layout
- Desktop: Horizontal layout
- Mobile: Vertical stack
- All controls accessible
- No scrolling needed

---

## 🔊 Feedback

### Toast Messages
When toggling modes:
- "📱 Switched to Single Scan"
- "📱 Switched to Quantity Mode"

When items are added:
- Single mode: "🛒 {Item Name} added to cart!"
- Quantity mode: "🛒 {Item Name} (x{Quantity}) added to cart!"

### Visual Feedback
- Button animates on hover (scale up)
- Color change on mode switch
- Smooth transitions
- Clear active state

---

## 💡 Smart Behavior

### Default Mode
- **One at a Time** is the default
- Most common use case
- Fastest for varied items
- Can switch anytime

### Mode Persistence
- Mode choice persists during scanning session
- Resets when stopping scanner
- Clean state for next session

### Quantity Input
- Only shows in Quantity Mode
- Minimum value: 1
- Large, easy-to-tap input
- Focused styling (blue theme)

---

## 🎓 Educational Value

### For Kids
- **Decision Making**: Choose the right mode for the situation
- **Efficiency**: Learn to optimize workflows
- **Pattern Recognition**: Identify when to use each mode
- **Problem Solving**: Adapt strategy based on items

### Real-World Skills
- Retail operations
- Inventory management
- Time optimization
- Technology adaptation

---

## 🛠️ Technical Implementation

### Component State
```typescript
singleScanMode = signal(true); // Default to one-at-a-time
scanQuantity = signal(1);      // Quantity for bulk mode
```

### Scan Logic
```typescript
const quantityToAdd = this.singleScanMode() ? 1 : this.scanQuantity();
this.cartService.addToCart(item, quantityToAdd);
```

### Toggle Function
```typescript
toggleScanMode(): void {
  this.singleScanMode.set(!this.singleScanMode());
  const mode = this.singleScanMode() ? 'Single Scan' : 'Quantity Mode';
  this.showToast(`📱 Switched to ${mode}`, 'info');
}
```

---

## 🎯 Best Practices

### When to Use One at a Time
✅ Multiple different items  
✅ One of each item  
✅ Fast checkout  
✅ Unknown quantities  

### When to Use Quantity Mode
✅ Bulk purchases  
✅ Same item multiple times  
✅ Pre-counted items  
✅ Wholesale transactions  

---

## 🔮 Future Enhancements

### Possible Features
- [ ] Remember user's preferred mode (localStorage)
- [ ] Auto-switch based on cart contents
- [ ] Quick quantity shortcuts (2, 5, 10)
- [ ] Voice control for quantity
- [ ] Barcode-based quantity (scan 2D code with quantity)
- [ ] Smart mode suggestion AI
- [ ] Scan statistics (items per minute)
- [ ] Gesture controls for mode switch

### Advanced Options
- [ ] Custom quantity presets
- [ ] Per-item quantity defaults
- [ ] Bulk discount visualization
- [ ] Quantity-based pricing

---

## 📊 Usage Examples

### Example 1: Grocery Store
```
Customer buys:
- 6 Apples
- 1 Bread
- 1 Milk
- 4 Yogurts

Optimal strategy:
1. Switch to Quantity Mode, set 6, scan Apple
2. Switch to One at a Time
3. Scan Bread
4. Scan Milk
5. Switch to Quantity Mode, set 4, scan Yogurt

Result: Fast and efficient checkout!
```

### Example 2: Variety Shop
```
Customer buys:
- 1 Toy Car
- 1 Puzzle
- 1 Book
- 1 Crayon Set

Optimal strategy:
1. Use One at a Time mode (default)
2. Scan each item sequentially
3. Done!

Result: Four quick scans, no mode switching needed!
```

### Example 3: Wholesale
```
Customer buys:
- 24 Water Bottles
- 12 Juice Boxes
- 36 Snack Bars

Optimal strategy:
1. Use Quantity Mode throughout
2. Set 24, scan Water Bottle
3. Set 12, scan Juice Box
4. Set 36, scan Snack Bar

Result: Only 3 scans for 72 items!
```

---

## 🎨 Design Rationale

### Why Default to One at a Time?
1. **Most common scenario**: Retail checkouts typically have varied items
2. **Safest choice**: Prevents accidental bulk additions
3. **Fastest for variety**: No stopping to change quantities
4. **Kid-friendly**: Simple concept, easy to understand
5. **Forgiving**: Easy to correct mistakes

### Color Choices
- **Green** (One at a Time): Go, ready, simple
- **Blue** (Quantity Mode): Controlled, thoughtful, precise

### Icon Choices
- **1️⃣** (One): Clear, literal, unmistakable
- **🔢** (Quantity): Multiple numbers, bulk concept

---

## 🏁 Summary

The dual scan mode feature provides **flexibility and efficiency** for all types of transactions:

- ✅ **Fast** for varied items (One at a Time)
- ✅ **Efficient** for bulk items (Quantity Mode)
- ✅ **Easy** to switch between modes
- ✅ **Clear** visual feedback
- ✅ **Mobile-friendly** design
- ✅ **Kid-appropriate** UX

**Default**: One at a Time - because it's the most versatile! 🎉

