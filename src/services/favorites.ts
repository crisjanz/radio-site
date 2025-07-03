import { API_CONFIG } from '../config/api';
import { authService } from './auth';
import type { Station } from '../types/Station';

export interface FavoriteResponse {
  id: number;
  userId: number;
  stationId: number;
  createdAt: string;
  station: Station;
}

class FavoritesService {
  private baseUrl = `${API_CONFIG.BASE_URL}/favorites`;

  async getFavorites(): Promise<Station[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch favorites error:', response.status, errorText);
        throw new Error(`Failed to fetch favorites: ${response.status} ${errorText}`);
      }

      const data: { favorites: FavoriteResponse[]; count: number } = await response.json();
      
      // Extract just the station data from the favorites
      return data.favorites.map(fav => fav.station);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      return [];
    }
  }

  async addFavorite(stationId: number): Promise<boolean> {
    try {
      console.log('Adding favorite:', { stationId, baseUrl: this.baseUrl, headers: authService.getAuthHeaders() });
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({ stationId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add favorite error:', response.status, errorText);
        if (response.status === 409) {
          // Station already in favorites
          return true;
        }
        throw new Error(`Failed to add favorite: ${response.status} ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  }

  async removeFavorite(stationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${stationId}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove favorite error:', response.status, errorText);
        throw new Error(`Failed to remove favorite: ${response.status} ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }

  async toggleFavorite(station: Station): Promise<{ isFavorite: boolean; favorites: Station[] }> {
    try {
      // Get current favorites to check if station is already favorited
      const currentFavorites = await this.getFavorites();
      const isCurrentlyFavorite = currentFavorites.some(fav => fav.id === station.id);

      let success: boolean;
      if (isCurrentlyFavorite) {
        success = await this.removeFavorite(station.id);
      } else {
        success = await this.addFavorite(station.id);
      }

      if (success) {
        // Fetch updated favorites
        const updatedFavorites = await this.getFavorites();
        return {
          isFavorite: !isCurrentlyFavorite,
          favorites: updatedFavorites
        };
      } else {
        return {
          isFavorite: isCurrentlyFavorite,
          favorites: currentFavorites
        };
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      const currentFavorites = await this.getFavorites();
      return {
        isFavorite: currentFavorites.some(fav => fav.id === station.id),
        favorites: currentFavorites
      };
    }
  }
}

// Export a singleton instance
export const favoritesService = new FavoritesService();