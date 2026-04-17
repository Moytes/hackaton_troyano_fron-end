import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Heeter } from './heeter';

describe('Heeter', () => {
  let component: Heeter;
  let fixture: ComponentFixture<Heeter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Heeter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Heeter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
