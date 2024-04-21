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

@Component({
  selector: 'app-metric-select-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, NgFor],
  templateUrl: './metric-select-list.component.html',
  styleUrl: './metric-select-list.component.scss',
})
export class MetricSelectListComponent {
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

  onLeafNodeClick(node: MetricFlatNode): void {
    this.leafNodeClicked.emit(node.fullKey);
  }
  hasChild = (_: number, node: MetricFlatNode) => node.expandable;
}
