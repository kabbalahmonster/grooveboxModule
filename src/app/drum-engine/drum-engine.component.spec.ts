import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DrumEngineComponent } from './drum-engine.component';

describe('DrumEngineComponent', () => {
  let component: DrumEngineComponent;
  let fixture: ComponentFixture<DrumEngineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrumEngineComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DrumEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
