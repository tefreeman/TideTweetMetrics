import { Component, OnInit } from '@angular/core';

/**
 * Represents the GraphBuilderComponent class.
 * This component is responsible for building graphs.
 */
@Component({
  selector: 'app-graph-builder',
  templateUrl: './graph-builder.component.html',
  styleUrls: ['./graph-builder.component.css']
})
export class GraphBuilderComponent implements OnInit {

  /**
   * Creates an instance of GraphBuilderComponent.
   */
  constructor() { }

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit() {
  }

}
