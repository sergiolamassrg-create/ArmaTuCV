import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CvFormularioComponent } from './cv-formulario.component';

describe('CvFormularioComponent', () => {
  let component: CvFormularioComponent;
  let fixture: ComponentFixture<CvFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvFormularioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvFormularioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
