# Guía de Integración Frontend-Backend

## TelcoNova - Sistema de Asignación de Técnicos

### Configuración Inicial

1. **Variables de Entorno**
   - Copia `.env.example` a `.env`
   - Configura `VITE_API_URL` con la URL de tu backend

```bash
cp .env.example .env
```

### Endpoints del Backend Requeridos

El frontend espera que el backend implemente los siguientes endpoints:

#### Autenticación

```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "access_token": "string",
  "token_type": "Bearer",
  "user": {
    "id": "string",
    "username": "string",
    "role": "supervisor" | "technician" | "admin"
  }
}

Response 401:
{
  "message": "Credenciales incorrectas"
}
```

**Seguridad requerida (HU_01):**
- Validar credenciales contra sistema de autenticación seguro
- Implementar bloqueo temporal (15 minutos) tras 3 intentos fallidos
- Registrar IP y timestamp de cada intento de login
- Solo permitir acceso a usuarios con rol "supervisor"

#### Técnicos

```
GET /api/technicians?zone={zone}&specialty={specialty}&availability={availability}
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "specialty": "string",
    "zone": "string",
    "availability": "available" | "busy" | "offline",
    "currentLoad": number,
    "certifications": ["string"]
  }
]
```

```
GET /api/technicians/{id}
Authorization: Bearer {token}

Response 200:
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "specialty": "string",
  "zone": "string",
  "availability": "available" | "busy" | "offline",
  "currentLoad": number,
  "certifications": ["string"]
}
```

#### Órdenes de Trabajo

```
GET /api/work-orders?status={status}&zone={zone}
Authorization: Bearer {token}

Response 200:
[
  {
    "id": "string",
    "clientName": "string",
    "address": "string",
    "zone": "string",
    "priority": "high" | "medium" | "low",
    "specialty": "string",
    "description": "string",
    "status": "pending" | "assigned" | "in_progress" | "completed",
    "assignedTechnicianId": "string" | null,
    "assignedAt": "ISO8601 datetime" | null,
    "assignedBy": "string" | null,
    "createdAt": "ISO8601 datetime"
  }
]
```

```
GET /api/work-orders/{id}
Authorization: Bearer {token}

Response 200:
{
  "id": "string",
  "clientName": "string",
  "address": "string",
  "zone": "string",
  "priority": "high" | "medium" | "low",
  "specialty": "string",
  "description": "string",
  "status": "pending" | "assigned" | "in_progress" | "completed",
  "assignedTechnicianId": "string" | null,
  "assignedAt": "ISO8601 datetime" | null,
  "assignedBy": "string" | null,
  "createdAt": "ISO8601 datetime"
}
```

#### Asignaciones

**Asignación Manual (HU_03):**
```
POST /api/assignments/manual
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "orderId": "string",
  "technicianId": "string"
}

Response 200:
{
  "id": "string",
  "clientName": "string",
  "address": "string",
  "zone": "string",
  "priority": "high" | "medium" | "low",
  "specialty": "string",
  "description": "string",
  "status": "assigned",
  "assignedTechnicianId": "string",
  "assignedAt": "ISO8601 datetime",
  "assignedBy": "string (supervisor username)",
  "createdAt": "ISO8601 datetime"
}
```

**Requisitos de implementación:**
- Registrar qué supervisor realizó la asignación (del token JWT)
- Registrar fecha/hora exacta de la asignación
- Actualizar estado de la orden a "assigned"
- Validar que el técnico exista y esté disponible
- Permitir reasignación controlada (registrar cambios en auditoría)

**Asignación Automática (HU_02):**
```
POST /api/assignments/automatic
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "orderId": "string"
}

Response 200:
{
  "id": "string",
  "clientName": "string",
  "address": "string",
  "zone": "string",
  "priority": "high" | "medium" | "low",
  "specialty": "string",
  "description": "string",
  "status": "assigned",
  "assignedTechnicianId": "string",
  "assignedAt": "ISO8601 datetime",
  "assignedBy": "automatic",
  "algorithm": "string (identificador del algoritmo usado)",
  "createdAt": "ISO8601 datetime"
}

Response 404:
{
  "message": "No hay técnicos disponibles que cumplan los criterios"
}
```

**Algoritmo de asignación automática:**
1. **Prioridad 1 - Especialidad**: Filtrar técnicos con la especialidad requerida
2. **Prioridad 2 - Carga de trabajo**: Seleccionar técnicos con menor número de órdenes asignadas
3. **Prioridad 3 - Zona**: De los técnicos filtrados, elegir el más cercano a la zona del cliente

**Requisitos de implementación:**
- Registrar el algoritmo y parámetros usados en la asignación
- Actualizar estado de la orden a "assigned"
- Si no hay técnicos disponibles, añadir a cola de espera
- Permitir validación/rechazo de asignación automática antes de confirmar

#### Notificaciones (HU_04)

```
POST /api/notifications/send
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "orderId": "string",
  "technicianId": "string",
  "channels": ["email", "sms"]
}

Response 200:
{
  "orderId": "string",
  "technicianId": "string",
  "sentAt": "ISO8601 datetime",
  "channels": {
    "email": {
      "sent": boolean,
      "deliveredAt": "ISO8601 datetime" | null
    },
    "sms": {
      "sent": boolean,
      "deliveredAt": "ISO8601 datetime" | null
    }
  }
}
```

**Contenido de la notificación debe incluir:**
- Número de orden
- Dirección del cliente
- Prioridad de la orden
- Contacto del cliente
- Descripción del trabajo
- NO debe incluir información sensitiva asociada a la orden

**Requisitos de implementación:**
- Envío en tiempo real
- Registrar estado de entrega y lectura
- Soporte para múltiples canales (email, SMS)

### Seguridad

Todas las solicitudes (excepto login) deben incluir:
```
Authorization: Bearer {access_token}
```

El backend debe validar:
- Token JWT válido y no expirado
- Rol de usuario apropiado (supervisor para asignaciones)
- Permisos específicos por endpoint

### Auditoría y Trazabilidad

El backend debe registrar:
- Todos los intentos de login (exitosos y fallidos) con IP y timestamp
- Todas las asignaciones (manuales y automáticas) con supervisor responsable
- Todas las reasignaciones con motivo y supervisor responsable
- Algoritmo usado en asignaciones automáticas
- Estado de entrega de notificaciones

### Estados de Disponibilidad

- `available`: Técnico disponible para nuevas asignaciones
- `busy`: Técnico ocupado con órdenes actuales
- `offline`: Técnico no disponible (fuera de horario, vacaciones, etc.)

### Prioridades de Orden

- `high`: Alta prioridad - requiere atención inmediata
- `medium`: Prioridad media - atención en el día
- `low`: Baja prioridad - puede programarse

### Estados de Orden

- `pending`: Orden creada, pendiente de asignación
- `assigned`: Orden asignada a un técnico
- `in_progress`: Técnico trabajando en la orden
- `completed`: Orden completada

### Notas de Implementación

1. **Búsqueda Avanzada (HU_03)**: El endpoint de técnicos soporta filtros opcionales por zona, especialidad y disponibilidad

2. **Validación de Credenciales (HU_01)**: 
   - Implementar rate limiting
   - Bloqueo temporal tras 3 intentos fallidos
   - Registro de auditoría de intentos

3. **Asignación Automática (HU_02)**:
   - El algoritmo debe ser documentado y versionado
   - Permitir rollback de asignaciones automáticas
   - Registrar parámetros usados para trazabilidad

4. **Notificaciones (HU_04)**:
   - Implementar cola de mensajes para manejo asíncrono
   - Reintentos automáticos en caso de fallo
   - Dashboard de estado de notificaciones

### Accesibilidad

El frontend implementa:
- Labels ARIA en todos los inputs
- Contraste de colores WCAG AA
- Navegación por teclado
- Soporte para lectores de pantalla

### Despliegue

1. **Frontend**: 
   ```bash
   npm install
   npm run build
   ```

2. **Variables de entorno en producción**:
   ```
   VITE_API_URL=https://api.telconova.com/api
   ```

### Testing

Para probar la integración:

1. Iniciar backend en `http://localhost:8000`
2. Configurar `.env` con URL del backend
3. Iniciar frontend: `npm run dev`
4. Acceder a `http://localhost:8080`

### Credenciales de Prueba

El backend debe proporcionar usuarios de prueba:
- Rol: supervisor
- Username: supervisor_test
- Password: (definir en backend)

### Soporte

Para preguntas sobre la integración:
- Revisar este documento
- Verificar logs del navegador (Console)
- Verificar logs del backend
- Verificar Network tab para ver requests/responses
