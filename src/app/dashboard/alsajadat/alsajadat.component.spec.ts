import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlsajadatComponent } from './alsajadat.component';

describe('AlsajadatComponent', () => {
  let component: AlsajadatComponent;
  let fixture: ComponentFixture<AlsajadatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlsajadatComponent]
    });
    fixture = TestBed.createComponent(AlsajadatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
