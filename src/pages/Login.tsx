import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import LoginCredentials from "@/components/LoginCredentials";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast({
        title: "Cuenta bloqueada",
        description: `Por favor espera ${blockTimer} minutos antes de intentar nuevamente.`,
        variant: "destructive",
      });
      return;
    }

    if (!username || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa usuario y contraseña.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login({ username, password });
      
      // Admins y supervisores pueden acceder
      if (response.user.role !== 'supervisor' && response.user.role !== 'admin') {
        toast({
          title: "Acceso denegado",
          description: "Solo supervisores y administradores pueden acceder a este módulo.",
          variant: "destructive",
        });
        apiService.clearToken();
        return;
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.username}`,
      });

      localStorage.setItem('user', JSON.stringify(response.user));
      navigate("/dashboard");
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 3) {
        setIsBlocked(true);
        setBlockTimer(15);
        
        const interval = setInterval(() => {
          setBlockTimer((prev) => {
            if (prev && prev <= 1) {
              clearInterval(interval);
              setIsBlocked(false);
              setFailedAttempts(0);
              return null;
            }
            return prev ? prev - 1 : null;
          });
        }, 60000);

        toast({
          title: "Cuenta bloqueada",
          description: "Has excedido el número de intentos permitidos. Tu cuenta está bloqueada por 15 minutos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Credenciales incorrectas",
          description: `Intento ${newFailedAttempts} de 3. ${3 - newFailedAttempts} intentos restantes.`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-hover to-sidebar-background p-4">
      <div className="w-full max-w-md">
      <Card className="shadow-strong">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo de TelcoNova SupportSuite, sistema de asignación de técnicos" className="h-32 w-auto" />
          </div>
          <CardDescription className="text-base">
            Sistema de Asignación de Técnicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBlocked && (
            <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                Cuenta bloqueada por {blockTimer} minutos debido a múltiples intentos fallidos.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulario de inicio de sesión">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || isBlocked}
                required
                aria-label="Campo de usuario"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || isBlocked}
                  required
                  aria-label="Campo de contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isBlocked}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || isBlocked}
              aria-label="Botón de iniciar sesión"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Solo supervisores y administradores pueden acceder
            </p>
          </div>
        </CardContent>
      </Card>
      
      <LoginCredentials />
      </div>
    </div>
  );
};

export default Login;
