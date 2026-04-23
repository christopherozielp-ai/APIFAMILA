import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Familiar {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  relacion: string;
  fechaNacimiento: string;
  direccion: string;
  ciudad: string;
  pais: string;
  edad?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FamiliaService {
  private familiares$ = new BehaviorSubject<Familiar[]>([]);
  private localStorageKey = 'apifamilia_familiares';
  private isLocalStorageAvailable = typeof window !== 'undefined' && !!localStorage;

  constructor() {
    if (this.isLocalStorageAvailable) {
      this.cargarFamiliares();
    }
  }

  private cargarFamiliares() {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    try {
      const datos = localStorage.getItem(this.localStorageKey);
      if (datos) {
        this.familiares$.next(JSON.parse(datos));
      }
    } catch (error) {
      console.error('Error al cargar familiares:', error);
    }
  }

  obtenerFamiliares(): Observable<Familiar[]> {
    return this.familiares$.asObservable();
  }

  obtenerFamiliarePorId(id: string): Familiar | undefined {
    return this.familiares$.value.find(f => f.id === id);
  }

  agregarFamiliar(familiar: Omit<Familiar, 'id'>): Familiar {
    const nuevoFamiliar: Familiar = {
      ...familiar,
      id: Date.now().toString(),
      edad: this.calcularEdad(familiar.fechaNacimiento)
    };

    const familiares = [...this.familiares$.value, nuevoFamiliar];
    this.familiares$.next(familiares);
    this.guardarEnLocal(familiares);

    return nuevoFamiliar;
  }

  actualizarFamiliar(id: string, familiar: Omit<Familiar, 'id'>): Familiar | null {
    const familiares = this.familiares$.value.map(f => {
      if (f.id === id) {
        return {
          ...familiar,
          id,
          edad: this.calcularEdad(familiar.fechaNacimiento)
        };
      }
      return f;
    });

    this.familiares$.next(familiares);
    this.guardarEnLocal(familiares);

    return this.obtenerFamiliarePorId(id) || null;
  }

  eliminarFamiliar(id: string): boolean {
    const familiares = this.familiares$.value.filter(f => f.id !== id);
    this.familiares$.next(familiares);
    this.guardarEnLocal(familiares);
    return true;
  }

  private guardarEnLocal(familiares: Familiar[]) {
    if (!this.isLocalStorageAvailable) {
      return;
    }

    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(familiares));
    } catch (error) {
      console.error('Error al guardar familiares:', error);
    }
  }

  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fecha = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }
}
