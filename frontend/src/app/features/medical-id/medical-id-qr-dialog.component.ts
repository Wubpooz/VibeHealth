import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-medical-id-qr-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="qr-dialog-header">
      <h2>Emergency QR Code</h2>
      <button mat-icon-button (click)="dialogRef.close()" aria-label="Close">
        <mat-icon fontIcon="close"></mat-icon>
      </button>
    </div>
    <div class="qr-dialog-content">
      @if (data.qrCodeUrl) {
        <div class="qr-large">
          <img class="qr-svg" [src]="data.qrCodeUrl" alt="Generated Medical ID QR Code" />
        </div>
      } @else {
        <mat-progress-spinner mode="indeterminate" diameter="64"></mat-progress-spinner>
      }
      <p>First responders can scan this code to view your critical medical information.</p>
    </div>
  `,
  styles: [`
    .qr-dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .qr-dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      text-align: center;
      min-width: 280px;
    }
    .qr-large {
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 8px solid #1f2937;
      border-radius: 12px;
      box-sizing: border-box;
      background: white;
    }
    .qr-svg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  `],
})
export class MedicalIdQrDialogComponent {
  readonly dialogRef = inject(MatDialogRef<MedicalIdQrDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { qrCodeUrl: string };
}
