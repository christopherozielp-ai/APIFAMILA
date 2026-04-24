import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FamiliaService, Familiar } from '../../servicios/familia.service';
import { AuthGoogle } from '../../servicios/auth-google';

@Component({
  selector: 'app-main',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main implements OnInit {
  familiares: Familiar[] = [];
  formularioFamiliar: FormGroup;
  mostrarFormulario = false;
  editandoId: number | null = null;
  usuarioNombre: string = '';
  cargando = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  relaciones = ['Padre', 'Madre', 'Hermano', 'Hermana', 'Hijo', 'Hija', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Primo', 'Prima', 'Cónyuge', 'Otro'];

  constructor(
    private familiaService: FamiliaService,
    private authGoogle: AuthGoogle,
    private fb: FormBuilder
  ) {
    this.formularioFamiliar = this.fb.group({
      nombre:          ['', Validators.required],
      apellido:        ['', Validators.required],
      email:           ['', [Validators.required, Validators.email]],
      telefono:        ['', Validators.required],
      relacion:        ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion:       ['', Validators.required],
      ciudad:          ['', Validators.required],
      pais:            ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarFamiliares();
    this.obtenerPerfil();
  }

  // ── Cargar lista ───────────────────────────────────────────
  cargarFamiliares() {
    this.cargando = true;
    this.mensajeError = null;
    this.familiaService.obtenerFamiliares().subscribe({
      next: (familiares) => {
        this.familiares = familiares;
        this.cargando = false;
      },
      error: (err) => {
        this.mensajeError = err.message;
        this.cargando = false;
      }
    });
  }

  // ── Guardar (crear o actualizar) ───────────────────────────
  guardarFamiliar() {
    if (this.formularioFamiliar.invalid) return;

    const datos = this.formularioFamiliar.value;
    this.cargando = true;
    this.mensajeError = null;

    if (this.editandoId !== null) {
      // ACTUALIZAR
      this.familiaService.actualizarFamiliar(this.editandoId, datos).subscribe({
        next: () => {
          this.mostrarExito('Miembro actualizado correctamente');
          this.cerrarFormulario();
          this.cargarFamiliares();
        },
        error: (err) => {
          this.mensajeError = err.message;
          this.cargando = false;
        }
      });
    } else {
      // CREAR
      this.familiaService.agregarFamiliar(datos).subscribe({
        next: () => {
          this.mostrarExito('Miembro agregado correctamente');
          this.cerrarFormulario();
          this.cargarFamiliares();
        },
        error: (err) => {
          this.mensajeError = err.message;
          this.cargando = false;
        }
      });
    }
  }

  // ── Editar ─────────────────────────────────────────────────
  editarFamiliar(familiar: Familiar) {
    this.editandoId = familiar.id;
    this.formularioFamiliar.patchValue({
      nombre:          familiar.nombre,
      apellido:        familiar.apellido,
      email:           familiar.email,
      telefono:        familiar.telefono,
      relacion:        familiar.relacion,
      fechaNacimiento: familiar.fechaNacimiento,
      direccion:       familiar.direccion,
      ciudad:          familiar.ciudad,
      pais:            familiar.pais
    });
    this.mostrarFormulario = true;
    this.mensajeError = null;
  }

  // ── Eliminar ───────────────────────────────────────────────
  eliminarFamiliar(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este miembro de la familia?')) return;

    this.familiaService.eliminarFamiliar(id).subscribe({
      next: () => {
        this.mostrarExito('Miembro eliminado correctamente');
        this.cargarFamiliares();
      },
      error: (err) => {
        this.mensajeError = err.message;
      }
    });
  }

  // ── Formulario ─────────────────────────────────────────────
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.editandoId = null;
    this.formularioFamiliar.reset();
    this.mensajeError = null;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.formularioFamiliar.reset();
    this.mensajeError = null;
  }

  // ── Perfil usuario ─────────────────────────────────────────
  obtenerPerfil() {
    try {
      const perfil = this.authGoogle.getperfil();
      if (perfil && perfil['given_name']) {
        this.usuarioNombre = perfil['given_name'];
      }
    } catch (error) {
      console.log('Perfil no disponible');
    }
  }

  cerrarSesion() {
    this.authGoogle.logout();
    window.location.href = '/login';
  }

  // ── Mensajes ───────────────────────────────────────────────
  private mostrarExito(mensaje: string) {
    this.mensajeExito = mensaje;
    setTimeout(() => this.mensajeExito = null, 3000);
  }
}
