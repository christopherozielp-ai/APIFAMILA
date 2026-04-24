import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Familiar {
  id: number;
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

  private apiUrl = 'http://localhost:8080/api/miembros';

  constructor(private http: HttpClient) {}

  // ── Obtener todos ──────────────────────────────────────────
  obtenerFamiliares(): Observable<Familiar[]> {
    return this.http.get<Familiar[]>(this.apiUrl).pipe(
      map(familiares => familiares.map(f => ({
        ...f,
        edad: this.calcularEdad(f.fechaNacimiento)
      }))),
      catchError(this.manejarError)
    );
  }

  // ── Obtener por ID ─────────────────────────────────────────
  obtenerFamiliarPorId(id: number): Observable<Familiar> {
    return this.http.get<Familiar>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.manejarError)
    );
  }

  // ── Crear ──────────────────────────────────────────────────
  agregarFamiliar(familiar: Omit<Familiar, 'id' | 'edad'>): Observable<Familiar> {
    return this.http.post<Familiar>(this.apiUrl, familiar).pipe(
      catchError(this.manejarError)
    );
  }

  // ── Actualizar ─────────────────────────────────────────────
  actualizarFamiliar(id: number, familiar: Omit<Familiar, 'id' | 'edad'>): Observable<Familiar> {
    return this.http.put<Familiar>(`${this.apiUrl}/${id}`, familiar).pipe(
      catchError(this.manejarError)
    );
  }

  // ── Eliminar ───────────────────────────────────────────────
  eliminarFamiliar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.manejarError)
    );
  }

  // ── Buscar ─────────────────────────────────────────────────
  buscarFamiliares(query: string): Observable<Familiar[]> {
    return this.http.get<Familiar[]>(`${this.apiUrl}/buscar?q=${query}`).pipe(
      catchError(this.manejarError)
    );
  }

  // ── Calcular edad ──────────────────────────────────────────
  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const fecha = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  }

  // ── Manejo de errores ──────────────────────────────────────
  private manejarError(error: HttpErrorResponse) {
    let mensaje = 'Ocurrió un error inesperado';
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. ¿Está corriendo Spring Boot?';
    } else if (error.status === 404) {
      mensaje = 'Miembro no encontrado';
    } else if (error.status === 409 || error.status === 400) {
      mensaje = error.error?.mensaje || error.error?.error || 'Datos inválidos';
    }
    return throwError(() => new Error(mensaje));
  }
}
