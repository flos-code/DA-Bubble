import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsSecondaryComponent } from './reactions-secondary.component';

describe('ReactionsSecondaryComponent', () => {
  let component: ReactionsSecondaryComponent;
  let fixture: ComponentFixture<ReactionsSecondaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionsSecondaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReactionsSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
