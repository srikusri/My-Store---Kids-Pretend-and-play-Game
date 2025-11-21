import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { GameState, Achievement, StoreTheme, GameMode } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Define themes first, before they're referenced
  private availableThemes: StoreTheme[] = [
    {
      id: 'candy',
      name: 'Candy Shop',
      icon: '🍬',
      unlocked: true,
      cost: 0,
      colors: { primary: '#FF6B9D', secondary: '#C44569', accent: '#FFC312' }
    },
    {
      id: 'toy',
      name: 'Toy Store',
      icon: '🧸',
      unlocked: false,
      cost: 100,
      colors: { primary: '#4834DF', secondary: '#686DE0', accent: '#FFC312' }
    },
    {
      id: 'pet',
      name: 'Pet Shop',
      icon: '🐾',
      unlocked: false,
      cost: 200,
      colors: { primary: '#00B894', secondary: '#00CEC9', accent: '#FDCB6E' }
    },
    {
      id: 'book',
      name: 'Book Store',
      icon: '📚',
      unlocked: false,
      cost: 300,
      colors: { primary: '#6C5CE7', secondary: '#A29BFE', accent: '#FD79A8' }
    },
    {
      id: 'space',
      name: 'Space Station',
      icon: '🚀',
      unlocked: false,
      cost: 500,
      colors: { primary: '#2D3436', secondary: '#636E72', accent: '#00B894' }
    }
  ];

  // Game state signals
  private gameStateSignal = signal<GameState>(this.getInitialGameState());

  gameState = this.gameStateSignal.asReadonly();
  level = computed(() => this.gameStateSignal().level);
  score = computed(() => this.gameStateSignal().score);
  coins = computed(() => this.gameStateSignal().coins);
  experience = computed(() => this.gameStateSignal().experience);
  experienceToNextLevel = computed(() => this.gameStateSignal().experienceToNextLevel);
  progressPercentage = computed(() =>
    (this.gameStateSignal().experience / this.gameStateSignal().experienceToNextLevel) * 100
  );

  private currentThemeSignal = signal<StoreTheme>(this.getDefaultTheme());
  currentTheme = this.currentThemeSignal.asReadonly();

  private soundEnabledSignal = signal(true);
  soundEnabled = this.soundEnabledSignal.asReadonly();

  constructor(private storageService: StorageService) {
    this.loadCustomThemes();
    this.loadGameState();
    this.checkDailyStreak();
  }

  private getInitialGameState(): GameState {
    return {
      level: 1,
      score: 0,
      coins: 50,
      experience: 0,
      experienceToNextLevel: 100,
      achievements: this.getInitialAchievements(),
      dailyStreak: 0,
      lastPlayDate: new Date().toDateString()
    };
  }

  private getInitialAchievements(): Achievement[] {
    return [
      {
        id: 'first_scan',
        name: 'First Scan!',
        description: 'Scan your first item',
        icon: '📷',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'scanner_pro',
        name: 'Scanner Pro',
        description: 'Scan 10 items',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'first_sale',
        name: 'First Sale!',
        description: 'Complete your first sale',
        icon: '💰',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'sales_master',
        name: 'Sales Master',
        description: 'Complete 20 sales',
        icon: '🌟',
        unlocked: false,
        progress: 0,
        maxProgress: 20
      },
      {
        id: 'inventory_expert',
        name: 'Inventory Expert',
        description: 'Add 15 items to inventory',
        icon: '📦',
        unlocked: false,
        progress: 0,
        maxProgress: 15
      },
      {
        id: 'coin_collector',
        name: 'Coin Collector',
        description: 'Earn 500 coins',
        icon: '💎',
        unlocked: false,
        progress: 0,
        maxProgress: 500
      },
      {
        id: 'week_streak',
        name: 'Week Warrior',
        description: 'Play for 7 days in a row',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        unlocked: false,
        progress: 0,
        maxProgress: 5
      }
    ];
  }

  private getDefaultTheme(): StoreTheme {
    return this.availableThemes[0];
  }

  private loadGameState(): void {
    const saved = localStorage.getItem('kids_game_state');
    if (saved) {
      const state = JSON.parse(saved);
      this.gameStateSignal.set(state);
    }
  }

  private saveGameState(): void {
    localStorage.setItem('kids_game_state', JSON.stringify(this.gameStateSignal()));
  }

  private checkDailyStreak(): void {
    const state = this.gameStateSignal();
    const lastPlay = new Date(state.lastPlayDate).toDateString();
    const today = new Date().toDateString();

    if (lastPlay !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastPlay === yesterday.toDateString()) {
        // Continued streak
        this.updateGameState({
          dailyStreak: state.dailyStreak + 1,
          lastPlayDate: today
        });
        this.addCoins(10, 'Daily Login Bonus! 🎉');
        this.updateAchievementProgress('week_streak', state.dailyStreak + 1);
      } else {
        // Streak broken
        this.updateGameState({
          dailyStreak: 1,
          lastPlayDate: today
        });
      }
    }
  }

  addExperience(amount: number): boolean {
    const state = this.gameStateSignal();
    const newExp = state.experience + amount;

    if (newExp >= state.experienceToNextLevel) {
      // Level up!
      const overflow = newExp - state.experienceToNextLevel;
      const newLevel = state.level + 1;
      const newExpRequired = Math.floor(state.experienceToNextLevel * 1.5);

      this.updateGameState({
        level: newLevel,
        experience: overflow,
        experienceToNextLevel: newExpRequired,
        coins: state.coins + (newLevel * 10)
      });

      this.updateAchievementProgress('level_5', newLevel);
      this.saveGameState();
      return true; // Level up occurred
    } else {
      this.updateGameState({ experience: newExp });
      this.saveGameState();
      return false;
    }
  }

  addScore(points: number): void {
    const state = this.gameStateSignal();
    this.updateGameState({ score: state.score + points });
    this.saveGameState();
  }

  addCoins(amount: number, reason?: string): void {
    const state = this.gameStateSignal();
    const newCoins = state.coins + amount;
    this.updateGameState({ coins: newCoins });
    this.updateAchievementProgress('coin_collector', newCoins);
    this.saveGameState();
  }

  spendCoins(amount: number): boolean {
    const state = this.gameStateSignal();
    if (state.coins >= amount) {
      this.updateGameState({ coins: state.coins - amount });
      this.saveGameState();
      return true;
    }
    return false;
  }

  unlockAchievement(achievementId: string): Achievement | null {
    const state = this.gameStateSignal();
    const achievement = state.achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
      this.addCoins(25, `Achievement: ${achievement.name}`);
      this.addExperience(50);
      this.saveGameState();
      return achievement;
    }

    return null;
  }

  updateAchievementProgress(achievementId: string, progress: number): Achievement | null {
    const state = this.gameStateSignal();
    const achievement = state.achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.progress = Math.min(progress, achievement.maxProgress);

      if (achievement.progress >= achievement.maxProgress) {
        return this.unlockAchievement(achievementId);
      }

      this.saveGameState();
    }

    return null;
  }

  getAvailableThemes(): StoreTheme[] {
    return this.availableThemes;
  }

  unlockTheme(themeId: string): boolean {
    const theme = this.availableThemes.find(t => t.id === themeId);
    if (theme && !theme.unlocked && this.spendCoins(theme.cost)) {
      theme.unlocked = true;
      this.saveGameState();
      return true;
    }
    return false;
  }

  setTheme(themeId: string): void {
    const theme = this.availableThemes.find(t => t.id === themeId && t.unlocked);
    if (theme) {
      this.currentThemeSignal.set(theme);
      localStorage.setItem('kids_current_theme', themeId);
    }
  }

  toggleSound(): void {
    this.soundEnabledSignal.set(!this.soundEnabledSignal());
    localStorage.setItem('kids_sound_enabled', String(this.soundEnabledSignal()));
  }

  private updateGameState(updates: Partial<GameState>): void {
    this.gameStateSignal.update((state: GameState) => ({ ...state, ...updates }));
  }

  // Game event handlers
  onItemScanned(): void {
    this.addExperience(5);
    this.addScore(10);
    this.updateAchievementProgress('first_scan', 1);

    const scannedCount = parseInt(localStorage.getItem('total_scans') || '0') + 1;
    localStorage.setItem('total_scans', String(scannedCount));
    this.updateAchievementProgress('scanner_pro', scannedCount);
  }

  onItemAdded(): void {
    this.addExperience(10);
    this.addScore(20);

    const itemCount = parseInt(localStorage.getItem('total_items_added') || '0') + 1;
    localStorage.setItem('total_items_added', String(itemCount));
    this.updateAchievementProgress('inventory_expert', itemCount);
  }

  onSaleCompleted(total: number): void {
    const coins = Math.floor(total / 10);
    this.addCoins(coins, 'Sale completed!');
    this.addExperience(20);
    this.addScore(50);
    this.updateAchievementProgress('first_sale', 1);

    const salesCount = parseInt(localStorage.getItem('total_sales') || '0') + 1;
    localStorage.setItem('total_sales', String(salesCount));
    this.updateAchievementProgress('sales_master', salesCount);
  }

  addCustomTheme(theme: StoreTheme): void {
    // Add to available themes
    this.availableThemes.push(theme);

    // Select the new theme
    this.setTheme(theme.id);

    // Save custom themes to local storage
    const customThemes = this.availableThemes.filter(t => t.id.startsWith('custom_'));
    this.storageService.setItem('custom_themes', JSON.stringify(customThemes));
  }

  private loadCustomThemes(): void {
    const customThemesStr = this.storageService.getItem('custom_themes');
    if (customThemesStr) {
      const customThemes = JSON.parse(customThemesStr) as StoreTheme[];
      this.availableThemes.push(...customThemes);
    }
  }
}

