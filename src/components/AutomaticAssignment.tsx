import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { apiService, WorkOrder } from "@/lib/api";
import { Zap, MapPin, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface AutomaticAssignmentProps {
  orders: WorkOrder[];
  onAssignment: () => void;
}

const AutomaticAssignment = ({ orders, onAssignment }: AutomaticAssignmentProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [recommendedTech, setRecommendedTech] = useState<any>(null);

  const handleAutoAssign = async () => {
    if (!selectedOrder) {
      toast({
        title: "Orden requerida",
        description: "Por favor selecciona una orden para asignar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.assignAutomatically(selectedOrder);

      toast({
        title: "Asignación automática exitosa",
        description: `La orden ha sido asignada al técnico más adecuado según especialidad, carga y zona.`,
      });

      setSelectedOrder("");
      setRecommendedTech(null);
      onAssignment();
    } catch (error: any) {
      if (error.message.includes('No hay técnicos disponibles')) {
        toast({
          title: "Sin técnicos disponibles",
          description: "No se encontraron técnicos disponibles que cumplan los criterios. La orden se añadirá a la cola.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error en la asignación",
          description: "No se pudo completar la asignación automática. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          El sistema seleccionará automáticamente al técnico más adecuado considerando:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Especialidad</strong>: Coincidencia con los requerimientos técnicos</li>
            <li><strong>Carga de trabajo</strong>: Menor número de órdenes asignadas</li>
            <li><strong>Zona</strong>: Mayor proximidad al cliente</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Asignación Automática
          </CardTitle>
          <CardDescription>
            Selecciona una orden y el sistema asignará el técnico óptimo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-lg font-medium">No hay órdenes pendientes</p>
                <p className="text-sm text-muted-foreground">
                  Todas las órdenes han sido asignadas
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 max-h-[500px] overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOrder === order.id
                          ? 'border-primary bg-secondary shadow-medium'
                          : 'border-border hover:border-primary/50 hover:shadow-soft'
                      }`}
                      onClick={() => setSelectedOrder(order.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">{order.clientName}</p>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.address}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {order.specialty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {order.zone}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {order.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleAutoAssign} 
                  disabled={!selectedOrder || loading}
                  className="w-full"
                  size="lg"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? "Asignando automáticamente..." : "Asignar Automáticamente"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {recommendedTech && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription>
            <p className="font-medium mb-2">Técnico recomendado:</p>
            <p>{recommendedTech.name} - {recommendedTech.specialty}</p>
            <p className="text-sm text-muted-foreground">
              Zona: {recommendedTech.zone} | Carga actual: {recommendedTech.currentLoad}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AutomaticAssignment;
