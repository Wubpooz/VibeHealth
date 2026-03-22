import {
  Component,
  ChangeDetectionStrategy,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface ScannedFood {
  barcode: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Component({
  selector: 'app-barcode-scanner',
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scanner-container">
      <!-- Scanner UI -->
      @if (!isScanning()) {
        <button 
          class="scan-button"
          (click)="startScanning()"
          type="button"
        >
          <svg class="scan-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
            <path d="M7 12h10"></path>
          </svg>
          <span>{{ 'METRICS.NUTRITION.SCAN_BARCODE' | translate }}</span>
        </button>
      } @else {
        <!-- Active Scanner View -->
        <div class="scanner-view">
          <div class="scanner-frame">
            <div class="corner-tl"></div>
            <div class="corner-tr"></div>
            <div class="corner-bl"></div>
            <div class="corner-br"></div>
            
            <!-- Scanning line animation -->
            <div class="scan-line"></div>
            
            <!-- Barcode icon in center -->
            <svg class="barcode-placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="5" width="2" height="14"></rect>
              <rect x="7" y="5" width="1" height="14"></rect>
              <rect x="10" y="5" width="3" height="14"></rect>
              <rect x="15" y="5" width="1" height="14"></rect>
              <rect x="18" y="5" width="3" height="14"></rect>
            </svg>
          </div>
          
          <p class="scanner-hint">{{ 'METRICS.NUTRITION.ALIGN_BARCODE' | translate }}</p>
          
          <button 
            class="cancel-button"
            (click)="stopScanning()"
            type="button"
          >
            {{ 'common.cancel' | translate }}
          </button>
        </div>
      }

      <!-- Coming Soon Notice -->
      @if (showNotice()) {
        <div 
          class="notice-overlay" 
          (click)="showNotice.set(false)"
          (keydown.escape)="showNotice.set(false)"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div 
            class="notice-card" 
            (click)="$event.stopPropagation()"
            (keydown)="$event.stopPropagation()"
            role="document"
          >
            <div class="notice-icon">📷</div>
            <h3 class="notice-title">{{ 'METRICS.NUTRITION.SCANNER_COMING_SOON' | translate }}</h3>
            <p class="notice-text">{{ 'METRICS.NUTRITION.SCANNER_DESCRIPTION' | translate }}</p>
            <button 
              class="notice-button"
              (click)="showNotice.set(false)"
              type="button"
            >
              {{ 'common.understood' | translate }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .scanner-container {
      width: 100%;
    }

    .scan-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      color: white;
      border: none;
      border-radius: 1rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
    }

    .scan-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(139, 92, 246, 0.3);
    }

    .scan-button:active {
      transform: translateY(0);
    }

    .scan-icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .scanner-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .scanner-frame {
      position: relative;
      width: 280px;
      height: 280px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* Corner brackets */
    .corner-tl,
    .corner-tr,
    .corner-bl,
    .corner-br {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 3px solid #8b5cf6;
    }

    .corner-tl {
      top: 20px;
      left: 20px;
      border-right: none;
      border-bottom: none;
      border-radius: 0.5rem 0 0 0;
    }

    .corner-tr {
      top: 20px;
      right: 20px;
      border-left: none;
      border-bottom: none;
      border-radius: 0 0.5rem 0 0;
    }

    .corner-bl {
      bottom: 20px;
      left: 20px;
      border-right: none;
      border-top: none;
      border-radius: 0 0 0 0.5rem;
    }

    .corner-br {
      bottom: 20px;
      right: 20px;
      border-left: none;
      border-top: none;
      border-radius: 0 0 0.5rem 0;
    }

    .scan-line {
      position: absolute;
      top: 0;
      left: 20px;
      right: 20px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
      animation: scan 2s ease-in-out infinite;
      box-shadow: 0 0 20px #8b5cf6;
    }

    @keyframes scan {
      0%, 100% {
        top: 20px;
        opacity: 0.8;
      }
      50% {
        top: calc(100% - 20px);
        opacity: 1;
      }
    }

    .barcode-placeholder {
      width: 120px;
      height: 120px;
      stroke: #a78bfa;
      opacity: 0.5;
    }

    .scanner-hint {
      font-size: 0.875rem;
      color: #6b7280;
      text-align: center;
      margin: 0;
    }

    :host-context([data-theme="dark"]) .scanner-hint {
      color: #9ca3af;
    }

    .cancel-button {
      padding: 0.75rem 2rem;
      background: transparent;
      color: #6b7280;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .cancel-button {
      border-color: #374151;
      color: #9ca3af;
    }

    .cancel-button:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    :host-context([data-theme="dark"]) .cancel-button:hover {
      background: #374151;
      border-color: #4b5563;
    }

    /* Notice Overlay */
    .notice-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .notice-card {
      background: white;
      border-radius: 1.5rem;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    :host-context([data-theme="dark"]) .notice-card {
      background: #1f2937;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .notice-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .notice-title {
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 1.5rem;
      color: #1f2937;
      margin: 0 0 1rem 0;
    }

    :host-context([data-theme="dark"]) .notice-title {
      color: #f3f4f6;
    }

    .notice-text {
      color: #6b7280;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
    }

    :host-context([data-theme="dark"]) .notice-text {
      color: #9ca3af;
    }

    .notice-button {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-family: 'Satoshi', sans-serif;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .notice-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 30px rgba(139, 92, 246, 0.3);
    }

    .notice-button:active {
      transform: translateY(0);
    }
  `],
})
export class BarcodeScannerComponent {
  readonly isScanning = signal(false);
  readonly showNotice = signal(false);
  
  // Output when a barcode is successfully scanned
  readonly foodScanned = output<ScannedFood>();

  startScanning(): void {
    // Show "coming soon" notice instead of actual scanner
    this.showNotice.set(true);
    
    // In the future, this would initialize camera and barcode detection
    // For now, it's a placeholder
  }

  stopScanning(): void {
    this.isScanning.set(false);
  }

  // Placeholder for when real scanning is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onBarcodeDetected(_barcode: string): void {
    // Would call an API to look up food data
    // Then emit the result
    this.stopScanning();
  }
}
