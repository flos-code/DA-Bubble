import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOwnMessageComponent } from './edit-own-message.component';

describe('EditOwnMessageComponent', () => {
  let component: EditOwnMessageComponent;
  let fixture: ComponentFixture<EditOwnMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOwnMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditOwnMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
