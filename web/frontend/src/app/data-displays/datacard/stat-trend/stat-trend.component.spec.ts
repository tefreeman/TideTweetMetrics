/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StatTrendComponent } from './stat-trend.component';

describe('StatTrendComponent', () => {
  let component: StatTrendComponent;
  let fixture: ComponentFixture<StatTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
