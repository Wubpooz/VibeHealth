import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollenService, PollenData } from '../../../core/pollen/pollen.service';
import { ProfileService } from '../../../core/profile/profile.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pollen',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pollen.component.html',
  styleUrls: ['./pollen.component.css']
})
export class PollenComponent implements OnInit {
  private readonly pollenService = inject(PollenService);
  private readonly profileService = inject(ProfileService);

  readonly pollen = this.pollenService.pollen;
  readonly isLoading = this.pollenService.isLoading;
  readonly hasLocation = signal(false);

  ngOnInit(): void {
    this.checkLocationAndLoadPollen();
  }

  private async checkLocationAndLoadPollen(): Promise<void> {
    const profile = await this.profileService.loadProfile();
    if (profile?.latitude && profile?.longitude) {
      this.hasLocation.set(true);
      await this.pollenService.loadPollenData();
    } else {
      this.hasLocation.set(false);
    }
  }

  async requestLocationPermission(): Promise<void> {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      await this.profileService.updateLocation(
        position.coords.latitude,
        position.coords.longitude
      );

      this.hasLocation.set(true);
      await this.pollenService.loadPollenData();
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please check your browser settings.');
    }
  }

  getPollenLevelDescription(level: number): string {
    return this.pollenService.getPollenLevelDescription(level);
  }

  getPollenLevelColor(level: number): string {
    return this.pollenService.getPollenLevelColor(level);
  }

  async refreshPollenData(): Promise<void> {
    await this.pollenService.loadPollenData();
  }
}
