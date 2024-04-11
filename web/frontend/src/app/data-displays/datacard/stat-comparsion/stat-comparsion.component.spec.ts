/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StatComparsionComponent } from './stat-comparsion.component';

describe('StatComparsionComponent', () => {
  let component: StatComparsionComponent;
  let fixture: ComponentFixture<StatComparsionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatComparsionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatComparsionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
