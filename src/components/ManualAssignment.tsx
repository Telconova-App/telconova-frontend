import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiService, WorkOrder, Technician } from "@/lib/api";
import { Search, MapPin, Award, Phone, Mail, UserCheck } from "lucide-react";

interface ManualAssignmentProps {
  orders: WorkOrder[];
  technicians: Technician[];
  onAssignment: () => void;
}

const ManualAssignment = ({ orders, technicians, onAssignment }: ManualAssignmentProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === "all" || tech.zone === zoneFilter;
    const matchesSpecialty = specialtyFilter === "all" || tech.specialty === specialtyFilter;
    const matchesAvailability = availabilityFilter === "all" || tech.availability === availabilityFilter;
    
    return matchesSearch && matchesZone && matchesSpecialty && matchesAvailability;
  });

  const zones = Array.from(new Set(technicians.map(t => t.zone)));
  const specialties = Array.from(new Set(technicians.map(t => t.specialty)));

  const handleAssign = async () => {
    if (!selectedOrder || !selectedTechnician) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una orden y un técnico.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.assignManually({
        orderId: selectedOrder,
        technicianId: selectedTechnician,
      });

      const order = orders.find(o => o.id === selectedOrder);
      const tech = technicians.find(t => t.id === selectedTechnician);

      // Send notification
      await apiService.sendNotification({
        orderId: selectedOrder,
        technicianId: selectedTechnician,
        channels: ['email', 'sms'],
      });

      toast({
        title: "Asignación exitosa",
        description: `Orden ${order?.id} asignada a ${tech?.name}. Notificación enviada.`,
      });

      setSelectedOrder("");
      setSelectedTechnician("");
      onAssignment();
    } catch (error) {
      toast({
        title: "Error en la asignación",
        description: "No se pudo completar la asignación. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Order Selection */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Seleccionar Orden</CardTitle>
          <CardDescription>
            Órdenes pendientes de asignación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay órdenes pendientes
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedOrder === order.id
                        ? 'border-primary bg-secondary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{order.clientName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.address}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{order.specialty}</Badge>
                      <Badge variant="outline">{order.zone}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technician Selection */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Seleccionar Técnico</CardTitle>
          <CardDescription>
            Búsqueda avanzada de técnicos disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Zona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las zonas</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {specialties.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="busy">Ocupado</SelectItem>
                    <SelectItem value="offline">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Technicians List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredTechnicians.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron técnicos con los filtros seleccionados
                </p>
              ) : (
                filteredTechnicians.map((tech) => (
                  <div
                    key={tech.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTechnician === tech.id
                        ? 'border-primary bg-secondary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTechnician(tech.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{tech.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {tech.email}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {tech.phone}
                        </p>
                      </div>
                      <Badge className={getAvailabilityColor(tech.availability)}>
                        {tech.availability}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">
                        <Award className="h-3 w-3 mr-1" />
                        {tech.specialty}
                      </Badge>
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {tech.zone}
                      </Badge>
                      <span className="text-muted-foreground">
                        Carga: {tech.currentLoad}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Assign Button */}
            <Button 
              onClick={handleAssign} 
              disabled={!selectedOrder || !selectedTechnician || loading}
              className="w-full"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {loading ? "Asignando..." : "Asignar Técnico"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualAssignment;
