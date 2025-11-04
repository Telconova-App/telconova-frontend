import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Technician } from "@/lib/api";
import { MapPin, Award } from "lucide-react";

interface TechniciansListProps {
  technicians: Technician[];
}

const TechniciansList = ({ technicians }: TechniciansListProps) => {
  const getLoadColor = (load: number) => {
    if (load === 0) return 'text-success';
    if (load <= 2) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Técnicos</CardTitle>
        <CardDescription>
          Lista de todos los técnicos registrados ({technicians.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {technicians.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" role="status">
            No hay técnicos registrados
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Lista de técnicos disponibles">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="p-4 border rounded-lg hover:shadow-soft transition-all"
                role="listitem"
                aria-label={`Técnico ${tech.name}, especialidad ${tech.specialty}, zona ${tech.zone}, ${tech.currentLoad} órdenes asignadas`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg">{tech.name}</h3>
                  <div className="text-right" aria-label={`Carga de trabajo: ${tech.currentLoad} órdenes`}>
                    <p className={`text-2xl font-bold ${getLoadColor(tech.currentLoad)}`}>
                      {tech.currentLoad}
                    </p>
                    <p className="text-xs text-muted-foreground">órdenes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium" aria-label={`Especialidad: ${tech.specialty}`}>{tech.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span className="text-sm font-medium" aria-label={`Zona: ${tech.zone}`}>{tech.zone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechniciansList;
