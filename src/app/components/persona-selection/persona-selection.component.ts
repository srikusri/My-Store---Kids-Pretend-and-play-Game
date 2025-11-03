import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../services/wallet.service';
import { PersonaType } from '../../models/wallet.model';

@Component({
  selector: 'app-persona-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!walletService.hasPersona()) {
      <div class="persona-overlay">
        <div class="persona-modal">
          <div class="persona-header">
            <h1>👋 Welcome to My Shop Game!</h1>
            <p>{{ selectedType() ? 'What\'s your name?' : 'Choose how you want to play' }}</p>
          </div>

          @if (!selectedType()) {
            <div class="persona-buttons">
              <button 
                class="simple-btn seller-btn"
                (click)="selectPersona(PersonaType.SELLER)">
                <span class="btn-icon">🏪</span>
                <span class="btn-text">I'm a Seller</span>
              </button>

              <button 
                class="simple-btn buyer-btn"
                (click)="selectPersona(PersonaType.BUYER)">
                <span class="btn-icon">🛍️</span>
                <span class="btn-text">I'm a Buyer</span>
              </button>
            </div>
          } @else {
            <div class="name-input-section">
              <div class="selected-persona-display">
                <span class="persona-icon-large">
                  {{ selectedType() === PersonaType.SELLER ? '🏪' : '🛍️' }}
                </span>
                <span class="persona-label">
                  {{ selectedType() === PersonaType.SELLER ? 'Seller' : 'Buyer' }}
                </span>
              </div>

              <input 
                type="text" 
                [(ngModel)]="personaName"
                [placeholder]="selectedType() === PersonaType.SELLER ? 'Enter store owner name' : 'Enter your name'"
                maxlength="20"
                class="name-input"
                (keyup.enter)="confirmSelection()"
                autofocus>

              <div class="button-group">
                <button 
                  class="btn btn-secondary"
                  (click)="goBack()">
                  ← Back
                </button>
                <button 
                  class="btn btn-primary btn-large"
                  (click)="confirmSelection()"
                  [disabled]="!personaName().trim()">
                  Start Playing 🚀
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .persona-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      animation: fadeIn 0.3s;
    }

    .persona-modal {
      background: white;
      border-radius: 24px;
      width: 95%;
      max-width: 600px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.5s;
    }

    .persona-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .persona-header h1 {
      font-size: 2.5rem;
      margin: 0 0 1rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .persona-header p {
      font-size: 1.25rem;
      color: #666;
      margin: 0;
    }

    .persona-buttons {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .simple-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      border: 3px solid;
      border-radius: 16px;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .simple-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .seller-btn {
      border-color: #56ab2f;
      color: #56ab2f;
    }

    .seller-btn:hover {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
      color: white;
      border-color: #56ab2f;
    }

    .buyer-btn {
      border-color: #FF6B9D;
      color: #FF6B9D;
    }

    .buyer-btn:hover {
      background: linear-gradient(135deg, #FF6B9D 0%, #C44569 100%);
      color: white;
      border-color: #FF6B9D;
    }

    .btn-icon {
      font-size: 3rem;
    }

    .btn-text {
      font-size: 1.75rem;
    }

    .name-input-section {
      text-align: center;
      animation: fadeIn 0.3s;
    }

    .selected-persona-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .persona-icon-large {
      font-size: 5rem;
      animation: bounce 2s infinite;
    }

    .persona-label {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .name-input {
      width: 100%;
      padding: 1.25rem 1.5rem;
      font-size: 1.25rem;
      border: 3px solid #e0e0e0;
      border-radius: 16px;
      text-align: center;
      font-weight: 600;
      transition: all 0.3s;
      margin-bottom: 2rem;
    }

    .name-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .button-group .btn {
      flex: 1;
      max-width: 200px;
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

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @media (max-width: 768px) {
      .persona-modal {
        padding: 2rem 1.5rem;
      }

      .persona-header h1 {
        font-size: 2rem;
      }

      .persona-header p {
        font-size: 1rem;
      }

      .simple-btn {
        padding: 1.5rem;
      }

      .btn-icon {
        font-size: 2.5rem;
      }

      .btn-text {
        font-size: 1.5rem;
      }

      .persona-icon-large {
        font-size: 4rem;
      }

      .button-group {
        flex-direction: column;
      }

      .button-group .btn {
        max-width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonaSelectionComponent {
  PersonaType = PersonaType;
  
  selectedType = signal<PersonaType | null>(null);
  personaName = signal('');

  constructor(public walletService: WalletService) {}

  selectPersona(type: PersonaType): void {
    this.selectedType.set(type);
    this.personaName.set('');
  }

  goBack(): void {
    this.selectedType.set(null);
    this.personaName.set('');
  }

  confirmSelection(): void {
    const type = this.selectedType();
    const name = this.personaName().trim();
    
    if (type && name) {
      this.walletService.createPersona(type, name);
    }
  }
}

