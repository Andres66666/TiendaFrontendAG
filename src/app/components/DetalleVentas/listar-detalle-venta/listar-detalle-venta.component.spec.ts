import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDetalleVentaComponent } from './listar-detalle-venta.component';

describe('ListarDetalleVentaComponent', () => {
  let component: ListarDetalleVentaComponent;
  let fixture: ComponentFixture<ListarDetalleVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarDetalleVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarDetalleVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
