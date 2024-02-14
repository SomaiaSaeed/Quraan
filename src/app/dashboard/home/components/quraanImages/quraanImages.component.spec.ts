/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { QuraanImagesComponent } from './quraanImages.component';

describe('QuraanImagesComponent', () => {
  let component: QuraanImagesComponent;
  let fixture: ComponentFixture<QuraanImagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuraanImagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuraanImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
