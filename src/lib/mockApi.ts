// Mock API service para desarrollo sin backend
import { 
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  Technician, 
  WorkOrder,
  AssignmentRequest,
  NotificationData,
  TechnicianRegistration
} from './api';
import { 
  mockUsers, 
  mockTechnicians, 
  mockWorkOrders, 
  simulateDelay 
} from './mockData';

class MockApiService {
  private token: string | null = null;
  private technicians: Technician[] = [...mockTechnicians];
  private workOrders: WorkOrder[] = [...mockWorkOrders];
  private failedAttempts: Map<string, number> = new Map();
  private blockedUsers: Map<string, number> = new Map();

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

  private isBlocked(username: string): boolean {
    const blockUntil = this.blockedUsers.get(username);
    if (!blockUntil) return false;
    
    if (Date.now() < blockUntil) {
      return true;
    } else {
      this.blockedUsers.delete(username);
      this.failedAttempts.delete(username);
      return false;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await simulateDelay(800);

    if (this.isBlocked(credentials.username)) {
      throw new Error('Cuenta bloqueada. Intenta nuevamente en 15 minutos.');
    }

    const user = mockUsers[credentials.username as keyof typeof mockUsers];
    
    if (!user || user.password !== credentials.password) {
      const attempts = (this.failedAttempts.get(credentials.username) || 0) + 1;
      this.failedAttempts.set(credentials.username, attempts);

      if (attempts >= 3) {
        const blockUntil = Date.now() + (15 * 60 * 1000); // 15 minutos
        this.blockedUsers.set(credentials.username, blockUntil);
        throw new Error('Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos.');
      }

      throw new Error('Credenciales incorrectas');
    }

    // Reset intentos fallidos en login exitoso
    this.failedAttempts.delete(credentials.username);

    const token = `mock-token-${Date.now()}`;
    this.setToken(token);

    return {
      message: 'Login exitoso',
      token: token,
      user: user.user,
    };
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    await simulateDelay(800);
    
    // Verificar si el usuario ya existe
    const existingUser = mockUsers[credentials.username as keyof typeof mockUsers];
    if (existingUser) {
      throw new Error('User with that email already exists');
    }
    
    // Simular registro exitoso
    console.log('Mock: Usuario registrado:', credentials.username);
    return {
      message: 'User registered'
    };
  }

  async logout(): Promise<void> {
    await simulateDelay(200);
    this.clearToken();
  }

  // Technicians endpoints
  async getTechnicians(filters?: {
    zone?: string;
    specialty?: string;
    availability?: string;
  }): Promise<Technician[]> {
    await simulateDelay(600);

    let filtered = [...this.technicians];

    if (filters?.zone && filters.zone !== 'all') {
      filtered = filtered.filter(t => t.zone === filters.zone);
    }

    if (filters?.specialty && filters.specialty !== 'all') {
      filtered = filtered.filter(t => t.specialty === filters.specialty);
    }

    if (filters?.availability && filters.availability !== 'all') {
      filtered = filtered.filter(t => t.availability === filters.availability);
    }

    return filtered;
  }

  async getTechnician(id: string): Promise<Technician> {
    await simulateDelay(400);
    
    const technician = this.technicians.find(t => t.id === id);
    if (!technician) {
      throw new Error('Técnico no encontrado');
    }
    
    return technician;
  }

  // Work orders endpoints
  async getWorkOrders(filters?: {
    status?: string;
    zone?: string;
  }): Promise<WorkOrder[]> {
    await simulateDelay(600);

    let filtered = [...this.workOrders];

    if (filters?.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }

    if (filters?.zone) {
      filtered = filtered.filter(o => o.zone === filters.zone);
    }

    return filtered;
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    await simulateDelay(400);
    
    const order = this.workOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    
    return order;
  }

  // Assignment endpoints
  async assignManually(data: AssignmentRequest): Promise<WorkOrder> {
    await simulateDelay(1000);

    const orderIndex = this.workOrders.findIndex(o => o.id === data.orderId);
    if (orderIndex === -1) {
      throw new Error('Orden no encontrada');
    }

    const technicianIndex = this.technicians.findIndex(t => t.id === data.technicianId);
    if (technicianIndex === -1) {
      throw new Error('Técnico no encontrado');
    }

    // Actualizar orden
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.workOrders[orderIndex] = {
      ...this.workOrders[orderIndex],
      status: 'assigned',
      assignedTechnicianId: data.technicianId,
      assignedAt: new Date().toISOString(),
      assignedBy: user.username || 'supervisor',
    };

    // Actualizar carga del técnico
    this.technicians[technicianIndex] = {
      ...this.technicians[technicianIndex],
      currentLoad: this.technicians[technicianIndex].currentLoad + 1,
      availability: this.technicians[technicianIndex].currentLoad + 1 >= 3 ? 'busy' : 'available',
    };

    return this.workOrders[orderIndex];
  }

  async assignAutomatically(orderId: string): Promise<WorkOrder> {
    await simulateDelay(1200);

    const orderIndex = this.workOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Orden no encontrada');
    }

    const order = this.workOrders[orderIndex];

    // Algoritmo de asignación automática
    // 1. Filtrar por especialidad
    let availableTechs = this.technicians.filter(
      t => t.specialty === order.specialty && t.availability === 'available'
    );

    if (availableTechs.length === 0) {
      throw new Error('No hay técnicos disponibles que cumplan los criterios');
    }

    // 2. Ordenar por carga de trabajo (menor a mayor)
    availableTechs.sort((a, b) => a.currentLoad - b.currentLoad);

    // 3. Si hay empate en carga, priorizar por zona
    const minLoad = availableTechs[0].currentLoad;
    const techsWithMinLoad = availableTechs.filter(t => t.currentLoad === minLoad);
    
    let selectedTech = techsWithMinLoad.find(t => t.zone === order.zone) || techsWithMinLoad[0];

    // Actualizar orden
    this.workOrders[orderIndex] = {
      ...this.workOrders[orderIndex],
      status: 'assigned',
      assignedTechnicianId: selectedTech.id,
      assignedAt: new Date().toISOString(),
      assignedBy: 'automatic',
    };

    // Actualizar carga del técnico
    const techIndex = this.technicians.findIndex(t => t.id === selectedTech.id);
    this.technicians[techIndex] = {
      ...this.technicians[techIndex],
      currentLoad: this.technicians[techIndex].currentLoad + 1,
      availability: this.technicians[techIndex].currentLoad + 1 >= 3 ? 'busy' : 'available',
    };

    return this.workOrders[orderIndex];
  }

  // Notifications endpoint
  async sendNotification(data: NotificationData): Promise<void> {
    await simulateDelay(800);
    
    console.log('📧 Notificación enviada:', {
      orderId: data.orderId,
      technicianId: data.technicianId,
      channels: data.channels,
      sentAt: new Date().toISOString(),
    });
  }

  // Technician registration endpoint
  async registerTechnician(data: TechnicianRegistration): Promise<{ message: string }> {
    await simulateDelay();
    
    const newTechnician: Technician = {
      id: `tech_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialty: data.specialty,
      zone: data.zone,
      availability: 'available',
      currentLoad: 0,
      certifications: []
    };
    
    this.technicians.push(newTechnician);
    
    return {
      message: 'Técnico registrado exitosamente'
    };
  }
}

export const mockApiService = new MockApiService();
