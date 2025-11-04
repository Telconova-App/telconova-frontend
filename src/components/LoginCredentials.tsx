import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Key, User } from "lucide-react";

const LoginCredentials = () => {
  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          Credenciales de Prueba
        </CardTitle>
        <CardDescription className="text-xs">
          Usa estas credenciales para explorar la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="border-success/30 bg-success/5">
          <User className="h-4 w-4 text-success" />
          <AlertDescription className="text-sm">
            <div className="font-semibold mb-1">Usuario de Prueba (Backend Real)</div>
            <div className="font-mono text-xs space-y-1">
              <div><strong>Email:</strong> test@example.com</div>
              <div><strong>Contraseña:</strong> secret</div>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-primary/30 bg-primary/5">
          <User className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <div className="font-semibold mb-1">Supervisor (Mock API)</div>
            <div className="font-mono text-xs space-y-1">
              <div><strong>Email:</strong> supervisor_test@telconova.com</div>
              <div><strong>Contraseña:</strong> password123</div>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Para usar el backend real de Spring Boot, cambia VITE_USE_MOCK_API=false en el archivo .env.
            Backend esperado en: http://localhost:8080/api
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LoginCredentials;
