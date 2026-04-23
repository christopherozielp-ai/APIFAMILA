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
  editandoId: string | null = null;
  usuarioNombre: string = '';
  
  relaciones = ['Padre', 'Madre', 'Hermano', 'Hermana', 'Hijo', 'Hija', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Primo', 'Prima', 'Cónyuge', 'Otro'];

  constructor(
    private familiaService: FamiliaService,
    private authGoogle: AuthGoogle,
    private fb: FormBuilder
  ) {
    this.formularioFamiliar = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      relacion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      pais: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarFamiliares();
    this.obtenerPerfil();
  }

  cargarFamiliares() {
    this.familiaService.obtenerFamiliares().subscribe(familiares => {
      this.familiares = familiares;
    });
  }

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

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.editandoId = null;
    this.formularioFamiliar.reset();
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.formularioFamiliar.reset();
  }

  guardarFamiliar() {
    if (this.formularioFamiliar.valid) {
      const datos = this.formularioFamiliar.value;
      
      if (this.editandoId) {
        this.familiaService.actualizarFamiliar(this.editandoId, datos);
      } else {
        this.familiaService.agregarFamiliar(datos);
      }
      
      this.cerrarFormulario();
      this.cargarFamiliares();
    }
  }

  editarFamiliar(familiar: Familiar) {
    this.editandoId = familiar.id;
    this.formularioFamiliar.patchValue(familiar);
    this.mostrarFormulario = true;
  }

  eliminarFamiliar(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este miembro de la familia?')) {
      this.familiaService.eliminarFamiliar(id);
      this.cargarFamiliares();
    }
  }

  cerrarSesion() {
    this.authGoogle.logout();
    window.location.href = '/login';
  }
}
