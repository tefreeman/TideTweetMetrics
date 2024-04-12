import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [MatListItem, MatIcon, MatTooltip, NgFor, RouterLink, NgIf, MatList],
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  @Input({required: true}) isExpanded: boolean = false;
  @Output() toggleMenu = new EventEmitter();

  public routeLinks = [
    { link: "about", name: "About", icon: "dashboard" },
    { link: "locations", name: "Locations", icon: "account_balance" },
  ];
  constructor() { }

  ngOnInit() {
  }

}
