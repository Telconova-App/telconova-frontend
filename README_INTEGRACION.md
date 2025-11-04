# Guía de Integración Frontend-Backend

## TelcoNova - Sistema de Asignación de Técnicos

Este frontend está integrado con el backend de Spring Boot proporcionado.

---

## 🚀 Inicio Rápido

### Opción 1: Usar Mock API (Desarrollo sin Backend)

1. Asegúrate que el archivo `.env` tenga:
```bash
VITE_USE_MOCK_API=true
```

2. Ejecuta el frontend:
```bash
npm install
npm run dev
```

3. Accede a `http://localhost:5173`

4. Usa las credenciales de prueba:
   - **Email**: `supervisor_test@telconova.com`
   - **Password**: `password123`

### Opción 2: Conectar con Backend Real

1. Inicia el backend de Spring Boot en `http://localhost:8080`

2. Configura el archivo `.env`:
```bash
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK_API=false
```

3. Ejecuta el frontend:
```bash
npm install
npm run dev
```

4. Usa las credenciales del backend (según `schema.sql`):
   - **Email**: `test@example.com`
   - **Password**: `secret`

---

## 📋 Endpoints del Backend Implementados

El frontend está integrado con los siguientes endpoints de Spring Boot:

### 1. Autenticación

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "test@example.com",
  "password": "secret"
}
```

**Response:**
```json
"Login successful"
```

**Notas:**
- El backend retorna un string, no un objeto JSON con token
- El frontend simula un token para mantener la sesión

#### POST `/api/auth/register`
**Request:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña",
  "name": "Nombre Completo",
  "role": "supervisor"
}
```

**Response:**
```json
"User registered"
```

### 2. Técnicos

#### GET `/api/technicians/all`
**Response:**
```json
[
  {
    "idTecnico": 1,
    "nameTecnico": "Juan Perez",
    "zoneTecnico": "Zona Oriente",
    "workloadTecnico": "4",
    "specialtyTecnico": "Electricidad"
  }
]
```

**Notas:**
- El frontend transforma automáticamente la respuesta del backend al formato esperado
- Mapea campos del backend (`idTecnico`, `nameTecnico`, etc.) a campos del frontend (`id`, `name`, etc.)

#### POST `/api/technicians/create`
**Request:**
```json
{
  "nameTecnico": "Nuevo Técnico",
  "zoneTecnico": "Norte",
  "workloadTecnico": "0",
  "specialtyTecnico": "Fibra Óptica"
}
```

**Response:**
```json
"Technician created"
```

---

## 🔄 Transformación de Datos

El frontend realiza transformaciones automáticas entre el formato del backend y el formato interno:

### Backend → Frontend

| Backend | Frontend | Descripción |
|---------|----------|-------------|
| `idTecnico` | `id` | ID numérico → string |
| `nameTecnico` | `name` | Nombre del técnico |
| `zoneTecnico` | `zone` | Zona de trabajo |
| `specialtyTecnico` | `specialty` | Especialidad |
| `workloadTecnico` | `currentLoad` | Carga (string → number) |

### Cálculo de Disponibilidad

El frontend calcula la disponibilidad basándose en la carga de trabajo:
- `workloadTecnico > 5` → `availability: 'busy'`
- `workloadTecnico ≤ 5` → `availability: 'available'`

---

## ⚠️ Funcionalidades Limitadas

Las siguientes funcionalidades del frontend **NO** están disponibles en el backend actual:

### ❌ No Implementadas en Backend

1. **Órdenes de Trabajo**
   - `GET /api/work-orders`
   - `GET /api/work-orders/:id`
   - Solución: Usar `VITE_USE_MOCK_API=true` para desarrollo

2. **Asignaciones**
   - `POST /api/assignments/manual`
   - `POST /api/assignments/automatic`
   - Solución: Usar `VITE_USE_MOCK_API=true` para desarrollo

3. **Notificaciones**
   - `POST /api/notifications/send`
   - Solución: Usar `VITE_USE_MOCK_API=true` para desarrollo

### 🔧 Modo Híbrido (Recomendado para Desarrollo)

Puedes modificar `src/lib/api.ts` para usar mock solo para endpoints faltantes:

```typescript
// Ejemplo: Usar backend real solo para autenticación y técnicos
async getTechnicians() {
  if (USE_MOCK_API) {
    return mockApiService.getTechnicians();
  }
  return this.request('/technicians/all'); // Backend real
}

async getWorkOrders() {
  // Siempre usa mock porque no existe en backend
  return mockApiService.getWorkOrders();
}
```

---

## 📊 Estructura del Backend

### Base de Datos H2 (En Memoria)

El backend usa H2 Database con las siguientes tablas:

#### Tabla: `usuarios`
```sql
- id_usuario (BIGINT, AUTO)
- email_usuario (VARCHAR, UNIQUE)
- password_usuario (VARCHAR, BCrypt)
- name_usuario (VARCHAR)
- role_usuario (VARCHAR)
```

#### Tabla: `tecnicos`
```sql
- id_tecnico (BIGINT, AUTO)
- name_tecnico (VARCHAR, UNIQUE)
- zone_tecnico (VARCHAR)
- workload_tecnico (VARCHAR)
- speciality_tecnico (VARCHAR)
```

### Usuario de Prueba (Pre-cargado)

El backend viene con un usuario de prueba:
- **Email**: `test@example.com`
- **Password**: `secret` (hasheada con BCrypt)
- **Role**: `Administrator`

---

## 🔐 Seguridad

### Frontend
- Almacena token simulado en `localStorage`
- Valida rol de usuario (solo supervisores/admins)
- Implementa bloqueo tras 3 intentos fallidos (mock)

### Backend
- Usa BCrypt para hashear contraseñas
- Spring Security configurado con CORS habilitado
- Endpoints de autenticación públicos
- Validación de entrada con `@Valid`

---

## 🐛 Solución de Problemas

### Error: "CORS policy"

**Problema**: El frontend no puede conectar con el backend

**Solución**: 
1. Verifica que el backend esté corriendo en `http://localhost:8080`
2. El backend ya tiene CORS configurado en `SecurityConfig.java`

### Error: "Invalid email or password"

**Problema**: Credenciales incorrectas

**Solución**:
1. Con mock: usa `supervisor_test@telconova.com` / `password123`
2. Con backend: usa `test@example.com` / `secret`

### Error: "Network request failed"

**Problema**: El backend no está corriendo

**Solución**:
1. Inicia el backend: `mvn spring-boot:run`
2. O cambia a modo mock: `VITE_USE_MOCK_API=true`

---

## 📝 Configuración de Variables de Entorno

### Desarrollo
```bash
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK_API=true  # Cambiar a false para backend real
```

### Producción
```bash
VITE_API_URL=https://api.tudominio.com/api
VITE_USE_MOCK_API=false
```

---

## 🎯 Próximos Pasos

Para implementar las funcionalidades faltantes en el backend:

1. **Órdenes de Trabajo**
   ```java
   @Entity
   class WorkOrder {
       @Id private Long id;
       private String clientName;
       private String address;
       // ... más campos
   }
   ```

2. **Asignaciones**
   ```java
   @PostMapping("/assignments/manual")
   public WorkOrder assignManually(@RequestBody AssignmentRequest request) {
       // Lógica de asignación manual
   }
   ```

3. **Notificaciones**
   ```java
   @PostMapping("/notifications/send")
   public void sendNotification(@RequestBody NotificationRequest request) {
       // Lógica de envío de notificaciones
   }
   ```

---

## 📚 Documentación Adicional

- **Backend API**: Ver `Backend.pdf` con la estructura completa
- **Especificaciones**: Ver `INTEGRATION.md` para detalles de endpoints
- **Frontend**: Este proyecto usa React + TypeScript + Vite

---

## 🤝 Soporte

Para problemas con:
- **Frontend**: Revisa este archivo y `src/lib/api.ts`
- **Backend**: Revisa `Backend.pdf` y los archivos Java
- **Integración**: Compara peticiones en DevTools Network tab

---

## ✅ Checklist de Integración

- [ ] Backend corriendo en `http://localhost:8080`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Archivo `.env` configurado correctamente
- [ ] Usuario de prueba disponible en BD
- [ ] Login funciona correctamente
- [ ] Lista de técnicos se carga desde backend
- [ ] Creación de técnicos funciona

---

**Última actualización**: 2025-01-27
**Versión Frontend**: 1.0.0
**Versión Backend**: Spring Boot 3.5.6
