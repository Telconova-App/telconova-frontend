// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Usar mock por defecto

// Import mock service
import { mockApiService } from './mockApi';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  role: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
}

export interface Technician {
  idTecnico: number;
  nameTecnico: string;
  zoneTecnico: string;
  workloadTecnico: string;
  specialtyTecnico: string;
  emailTecnico?: string;
  // Frontend compatibility fields
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  zone?: string;
  availability?: 'available' | 'busy' | 'offline';
  currentLoad?: number;
  certifications?: string[];
}

export interface WorkOrder {
  id: string;
  nombreCliente?: string;
  direccion?: string;
  zona: string;
  prioridad?: 'alta' | 'media' | 'baja';
  servicio: string;
  descripcion: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assignedTo?: string;
  asignadoEn?: string;
  asignadoPor?: string;
  creadoEn: string;
}

export interface AssignmentRequest {
  idOrden: string;
  idTecnico?: string;
  automatico?: boolean;
}

export interface NotificationData {
  idOrden: string;
  idTecnico: string;
  canales: ('email' | 'sms')[];
}

export interface TechnicianRegistration {
  nameTecnico: string;
  zoneTecnico: string;
  workloadTecnico: string;
  specialtyTecnico: string;
}

// Report interfaces
export interface SavedReport {
  idReporte: string;
  nombreReporte: string;
  filtros: {
    startDate: string;
    endDate: string;
    serviceType: string;
    zone: string;
  };
  metricas: Array<{
    technicianId: string;
    technicianName: string;
    zone: string;
    specialty: string;
    totalOrders: number;
    completedOrders: number;
    inProgressOrders: number;
    avgResolutionTime: number;
  }>;
  resumen: {
    totalOrders: number;
    totalCompleted: number;
    totalInProgress: number;
    avgResolutionTime: number;
  };
  creadoEn: string;
  creadoPor: string;
  creadoPorNombre?: string;
}

export interface SaveReportRequest {
  nombreReporte: string;
  filtros: SavedReport['filtros'];
  metricas: SavedReport['metricas'];
  resumen: SavedReport['resumen'];
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Spring Boot puede devolver texto plano en algunos errores
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
        throw new Error(error.message || 'Error en la solicitud');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en la solicitud');
      }
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (USE_MOCK_API) {
      return mockApiService.login(credentials);
    }

    const response = await this.request<{ token: string; tokenType: string; email: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Use the real JWT token from backend
    const token = response.token;
    this.setToken(token);

    return {
      message: 'Login successful',
      token: token,
      user: {
        id: response.email,
        username: response.email,
        role: 'supervisor'
      }
    };
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    if (USE_MOCK_API) {
      return mockApiService.register(credentials);
    }

    const response = await this.request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return {
      message: response
    };
  }

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.logout();
    }
    this.clearToken();
  }

  // Technicians endpoints
  async getTechnicians(filters?: {
    zone?: string;
    specialty?: string;
    availability?: string;
  }): Promise<Technician[]> {
    if (USE_MOCK_API) {
      return mockApiService.getTechnicians(filters);
    }

    const technicians = await this.request<Technician[]>('/api/technicians/all');

    // Transform backend format to frontend format and apply filters
    return technicians
      .map(tech => ({
        ...tech,
        id: tech.idTecnico.toString(),
        name: tech.nameTecnico,
        zone: tech.zoneTecnico,
        specialty: tech.specialtyTecnico,
        currentLoad: parseInt(tech.workloadTecnico) || 0,
        availability: parseInt(tech.workloadTecnico) > 5 ? 'busy' as const : 'available' as const,
        email: tech.emailTecnico || `${tech.nameTecnico.toLowerCase().replace(/\s+/g, '.')}@telconova.com`,
        phone: '+1234567890',
        certifications: []
      }))
      .filter(tech => {
        if (filters?.zone && tech.zone !== filters.zone) return false;
        if (filters?.specialty && tech.specialty !== filters.specialty) return false;
        if (filters?.availability && tech.availability !== filters.availability) return false;
        return true;
      });
  }

  async getTechnician(id: string): Promise<Technician> {
    if (USE_MOCK_API) {
      return mockApiService.getTechnician(id);
    }
    return this.request<Technician>(`/technicians/${id}`);
  }

  // Work orders endpoints
  async getWorkOrders(filters?: {
    status?: string;
    zona?: string;
  }): Promise<WorkOrder[]> {
    if (USE_MOCK_API) {
      return mockApiService.getWorkOrders(filters);
    }
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.zona) params.append('zona', filters.zona);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<WorkOrder[]>(`/api/orders/all${query}`);
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    if (USE_MOCK_API) {
      return mockApiService.getWorkOrder(id);
    }
    return this.request<WorkOrder>(`/api/orders/${id}`);
  }

  // Assignment endpoints
  async assignManually(data: AssignmentRequest): Promise<WorkOrder> {
    if (USE_MOCK_API) {
      return mockApiService.assignManually(data);
    }
    return this.request<WorkOrder>('/assignments/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignAutomatically(orderId: string): Promise<WorkOrder> {
    if (USE_MOCK_API) {
      return mockApiService.assignAutomatically(orderId);
    }
    return this.request<WorkOrder>('/assignments/automatic', {
      method: 'POST',
      body: JSON.stringify({ idOrden: orderId }),
    });
  }

  // Notifications endpoint
  async sendNotification(data: NotificationData): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.sendNotification(data);
    }
    await this.request('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Technician registration endpoint
  async registerTechnician(data: TechnicianRegistration): Promise<{ message: string }> {
    if (USE_MOCK_API) {
      return mockApiService.registerTechnician(data);
    }

    const response = await this.request<string>('/technicians/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      message: response
    };
  }

  // Reports endpoints
  async saveReport(data: SaveReportRequest): Promise<SavedReport> {
    if (USE_MOCK_API) {
      return mockApiService.saveReport(data);
    }

    const response = await this.request<{ data: SavedReport }>('/reports/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Parse JSON strings if needed
    const report = response.data;
    if (typeof report.filtros === 'string') {
      report.filtros = JSON.parse(report.filtros);
    }
    if (typeof report.metricas === 'string') {
      report.metricas = JSON.parse(report.metricas);
    }
    if (typeof report.resumen === 'string') {
      report.resumen = JSON.parse(report.resumen);
    }

    return report;
  }

  async getReportHistory(
    page = 1,
    limit = 10,
    sortBy = 'creadoEn',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ reports: SavedReport[]; pagination: any }> {
    if (USE_MOCK_API) {
      return mockApiService.getReportHistory(page, limit, sortBy, sortOrder);
    }

    const response = await this.request<{ data: { reports: SavedReport[]; pagination: any } }>(
      `/reports/history?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );

    // Parse JSON strings in each report
    response.data.reports.forEach(report => {
      if (typeof report.filtros === 'string') {
        report.filtros = JSON.parse(report.filtros);
      }
      if (typeof report.metricas === 'string') {
        report.metricas = JSON.parse(report.metricas);
      }
      if (typeof report.resumen === 'string') {
        report.resumen = JSON.parse(report.resumen);
      }
    });

    return response.data;
  }

  async getReportDetail(reportId: string): Promise<SavedReport> {
    if (USE_MOCK_API) {
      return mockApiService.getReportDetail(reportId);
    }

    const response = await this.request<{ data: SavedReport }>(`/reports/history/${reportId}`);

    // Parse JSON strings if needed
    const report = response.data;
    if (typeof report.filtros === 'string') {
      report.filtros = JSON.parse(report.filtros);
    }
    if (typeof report.metricas === 'string') {
      report.metricas = JSON.parse(report.metricas);
    }
    if (typeof report.resumen === 'string') {
      report.resumen = JSON.parse(report.resumen);
    }

    return report;
  }

  async deleteReport(reportId: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.deleteReport(reportId);
    }

    await this.request(`/reports/history/${reportId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
