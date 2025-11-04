import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/lib/api";
import { MapPin, Calendar, User, RefreshCw } from "lucide-react";

interface WorkOrdersListProps {
  orders: WorkOrder[];
  onRefresh: () => void;
}

const WorkOrdersList = ({ orders, onRefresh }: WorkOrdersListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'assigned': return 'bg-primary text-primary-foreground';
      case 'in_progress': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-success text-success-foreground';
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      assigned: 'Asignada',
      in_progress: 'En Progreso',
      completed: 'Completada'
    };
    return labels[status] || status;
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Órdenes de Trabajo</CardTitle>
            <CardDescription>
              Todas las órdenes del sistema ({orders.length} total)
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            aria-label="Actualizar lista de órdenes de trabajo"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" role="status">
            No hay órdenes registradas
          </p>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto" role="list" aria-label="Lista de órdenes de trabajo">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 border rounded-lg hover:shadow-soft transition-all"
                role="listitem"
                aria-label={`Orden de trabajo para ${order.clientName}, estado ${getStatusLabel(order.status)}, prioridad ${order.priority}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{order.clientName}</h3>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.address}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Especialidad</p>
                    <p className="font-medium">{order.specialty}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Zona</p>
                    <p className="font-medium">{order.zone}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs">Fecha creación</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {order.assignedTechnicianId && (
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Asignado por</p>
                      <p className="font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.assignedBy || 'Sistema'}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {order.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrdersList;
