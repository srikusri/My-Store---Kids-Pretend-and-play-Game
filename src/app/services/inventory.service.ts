import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { InventoryItem } from '../models/inventory-item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventorySignal = signal<InventoryItem[]>([]);
  
  inventory = this.inventorySignal.asReadonly();
  inventoryCount = computed(() => this.inventorySignal().length);

  constructor(private storageService: StorageService) {
    this.loadInventory();
  }

  private loadInventory(): void {
    const items = this.storageService.getInventory();
    this.inventorySignal.set(items);
  }

  getItemByBarcode(barcode: string): InventoryItem | undefined {
    return this.inventorySignal().find(item => item.barcode === barcode);
  }

  addItem(barcode: string, name: string, price: number, quantity: number): InventoryItem {
    const existingItem = this.getItemByBarcode(barcode);
    
    if (existingItem) {
      return this.updateItem(existingItem.id, { name, price, quantity });
    }

    const newItem: InventoryItem = {
      id: this.generateId(),
      barcode,
      name,
      price,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedInventory = [...this.inventorySignal(), newItem];
    this.inventorySignal.set(updatedInventory);
    this.storageService.saveInventory(updatedInventory);
    
    return newItem;
  }

  updateItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'barcode' | 'createdAt'>>): InventoryItem {
    const updatedInventory = this.inventorySignal().map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date()
        };
      }
      return item;
    });

    this.inventorySignal.set(updatedInventory);
    this.storageService.saveInventory(updatedInventory);
    
    return updatedInventory.find(item => item.id === id)!;
  }

  decreaseQuantity(barcode: string, quantity: number): boolean {
    const item = this.getItemByBarcode(barcode);
    
    if (!item || item.quantity < quantity) {
      return false;
    }

    this.updateItem(item.id, { quantity: item.quantity - quantity });
    return true;
  }

  deleteItem(id: string): void {
    const updatedInventory = this.inventorySignal().filter(item => item.id !== id);
    this.inventorySignal.set(updatedInventory);
    this.storageService.saveInventory(updatedInventory);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

