import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn btn-primary achievements-btn" (click)="showModal = true">
      <span class="btn-icon">🏆</span>
      <span class="btn-text">Achievements</span>
    </button>

    @if (showModal) {
      <div class="modal-overlay" (click)="showModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>🏆 Your Achievements</h2>
            <button class="close-button" (click)="showModal = false">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="achievements-grid">
              @for (achievement of gameService.gameState().achievements; track achievement.id) {
                <div class="achievement-card" [class.unlocked]="achievement.unlocked">
                  <div class="achievement-icon">{{ achievement.icon }}</div>
                  <div class="achievement-info">
                    <h3>{{ achievement.name }}</h3>
                    <p>{{ achievement.description }}</p>
                    @if (!achievement.unlocked) {
                      <div class="progress-bar">
                        <div class="progress-fill" 
                             [style.width.%]="(achievement.progress / achievement.maxProgress) * 100">
                        </div>
                        <span class="progress-text">
                          {{ achievement.progress }} / {{ achievement.maxProgress }}
                        </span>
                      </div>
                    } @else {
                      <div class="unlocked-badge">✓ Unlocked!</div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .achievements-btn {
      font-size: 1rem;
      font-weight: 600;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px 20px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.75rem;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 3rem;
      color: white;
      cursor: pointer;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
      line-height: 1;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 2rem;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .achievement-card {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 16px;
      border: 3px solid #e0e0e0;
      transition: all 0.3s;
    }

    .achievement-card.unlocked {
      background: linear-gradient(135deg, #FFF5E6, #FFE5B4);
      border-color: #FFC312;
      box-shadow: 0 4px 12px rgba(255, 195, 18, 0.3);
    }

    .achievement-icon {
      font-size: 3rem;
      filter: grayscale(100%);
      transition: filter 0.3s;
    }

    .achievement-card.unlocked .achievement-icon {
      filter: grayscale(0%);
      animation: wiggle 0.5s;
    }

    .achievement-info {
      flex: 1;
    }

    .achievement-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      color: #333;
    }

    .achievement-info p {
      margin: 0 0 1rem 0;
      color: #666;
      font-size: 0.875rem;
    }

    .progress-bar {
      height: 24px;
      background: #e0e0e0;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.5s ease;
      border-radius: 12px;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #333;
    }

    .unlocked-badge {
      background: #4CAF50;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      display: inline-block;
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

    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchievementsComponent {
  showModal = false;

  constructor(public gameService: GameService) {}
}

