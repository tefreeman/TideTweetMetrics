import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../core/modules/material/material.module';

@Component({
  selector: 'app-add-graph',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './add-graph-dialog.component.html',
  styleUrl: './add-graph-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGraphDialogComponent {}
