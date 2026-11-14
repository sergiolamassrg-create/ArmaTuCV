import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CvListadoComponent } from './cv-listado.component';

describe('CvListadoComponent', () => {
  let component: CvListadoComponent;
  let fixture: ComponentFixture<CvListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvListadoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CvListadoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
