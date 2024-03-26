import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphDataColorService {

  constructor() { }

    // Function to get background color based on index
    getBackgroundColor(index: number): string {
      // Add ~20 colors
      const colors = [
        'rgba(241, 116, 99)',    // Original red
        'rgba(180, 218, 225)',   // Original blue
        'rgba(90, 185, 113)',    // Original green
        'rgba(119, 118, 188)',   // Original purple
        'rgba(253, 216, 53)',    // Original yellow
        'rgba(239, 99, 81)',     // Red variation
        'rgba(255, 173, 99)',    // Orange
        'rgba(255, 205, 86)',    // Yellow
        'rgba(75, 192, 192)',    // Teal
        'rgba(54, 162, 235)',    // Sky blue
        'rgba(153, 102, 255)',   // Lavender
        'rgba(255, 159, 64)',    // Peach
        'rgba(233, 30, 99)',     // Pink
        'rgba(205, 220, 57)',    // Lime green
        'rgba(76, 175, 80)',     // Darker green
        'rgba(100, 181, 246)',   // Light blue
        'rgba(121, 85, 72)',     // Brown
        'rgba(156, 39, 176)',    // Dark purple
        'rgba(63, 81, 181)',     // Indigo
        'rgba(255, 87, 34)'      // Deep orange
      ];
      return colors[index % colors.length]; 
    }
  
}
