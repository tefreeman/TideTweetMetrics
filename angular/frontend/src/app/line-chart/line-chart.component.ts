import { Component, OnInit, Input, HostListener} from '@angular/core';
import Chart from 'chart.js/auto';
import { IGraph } from '../graph.service';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})

export class LineChartComponent implements OnInit{
  @Input() graph: IGraph;
  constructor(){
    this.graph = {'id': '', 'name': '', 'type': '', 'data': {labels: [], datasets: []}};

  }
  public chart: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.chart) {
      this.chart.destroy();
      this.createChart();
    }
  }

  ngOnInit() {
    this.createChart();
  }
  createChart(){
  
    this.chart = new Chart(this.graph.id, {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: this.graph.data.labels,
	       datasets: this.graph.data.datasets
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }

}
