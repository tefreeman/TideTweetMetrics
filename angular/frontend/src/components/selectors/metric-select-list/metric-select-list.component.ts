import { FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { Observable, map } from 'rxjs';
import { MaterialModule } from '../../../core/modules/material/material.module';
import { KeyTranslatorService } from '../../../core/services/key-translator.service';
import { MetricService } from '../../../core/services/metrics/metric.service';

interface MetricNode {
  name: string;
  children?: MetricNode[];
  fullKey: string;
}

interface MetricFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  fullKey: string;
}

/**
 * Represents the MetricSelectListComponent.
 */
@Component({
  selector: 'app-metric-select-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, NgFor],
  templateUrl: './metric-select-list.component.html',
  styleUrl: './metric-select-list.component.scss',
})
export class MetricSelectListComponent {
  /**
   * Event emitter for leaf node click.
   */
  @Output() leafNodeClicked = new EventEmitter<any>();

  private _metricService = inject(MetricService);
  private _keyTranslatorService: KeyTranslatorService =
    inject(KeyTranslatorService);

  private _transformer = (node: MetricNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      fullKey: node.fullKey, // Directly use the fullKey from the node
    };
  };

  /**
   * Retrieves the grouped metrics as an Observable.
   * @returns An Observable of MetricNode[].
   */
  getMetricsGrouped(): Observable<MetricNode[]> {
    return this._metricService.getMetricNames().pipe(
      map((keys: string[]) => {
        const root: MetricNode[] = [];
        keys.forEach((key) => {
          const parts = this._keyTranslatorService.keyToFullStringParts(
            key,
            true
          );
          let currentLevel = root; // Start with the root
          let currentPath = ''; // Initialize the current path

          parts.forEach((part, index) => {
            currentPath += (index > 0 ? '.' : '') + part;
            let node = currentLevel.find((n) => n.name === part);

            if (!node) {
              node = { name: part, children: [], fullKey: key };
              currentLevel.push(node);
            }

            if (index < parts.length - 1) {
              node.children = node.children || [];
              currentLevel = node.children;
            }
          });
        });
        return root;
      })
    );
  }

  treeControl = new FlatTreeControl<MetricFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.getMetricsGrouped().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  /**
   * Handles the click event on a leaf node.
   * @param node - The clicked MetricFlatNode.
   */
  onLeafNodeClick(node: MetricFlatNode): void {
    this.leafNodeClicked.emit(node.fullKey);
  }

  /**
   * Checks if a node has children.
   * @param _ - The index of the node.
   * @param node - The MetricFlatNode to check.
   * @returns A boolean indicating if the node has children.
   */
  hasChild = (_: number, node: MetricFlatNode) => node.expandable;
}
