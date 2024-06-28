import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';

/**
 * Represents the CardBarComponent class.
 */
@Component({
  selector: 'app-card-bar',
  standalone: true,
  imports: [CommonModule, MaterialModule, AsyncPipe],
  templateUrl: './cardBar.component.html',
  styleUrl: './cardBar.component.scss',
  schemas: [],
})
export class CardBarComponent {
  private isDragging = false;
  private startX: number = 0;
  private scrollLeft: number = 0;

  constructor() { }

  /**
   * Sets the isDragging property to true.
   */
  startQuickDrag() {
    this.isDragging = true;
  }

  /**
   * Sets the isDragging property to true and initializes the startX and scrollLeft properties.
   * @param event - The MouseEvent or TouchEvent object.
   */
  startDragging(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;
    // Store the current scroll position
    const element = event.target as HTMLElement;
    this.scrollLeft = element.scrollLeft;
  }

  /**
   * Updates the scroll position based on the drag movement.
   * @param event - The MouseEvent or TouchEvent object.
   */
  onDragging(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault(); // Prevents selection of text etc.
    const x =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;
    const walk = (x - this.startX) * 2; // The number 3 determines the sensitivity of the drag
    const element = event.target as HTMLElement;
    element.scrollLeft = this.scrollLeft - walk;
  }

  /**
   * Sets the isDragging property to false.
   */
  stopDragging(): void {
    this.isDragging = false;
  }
}
