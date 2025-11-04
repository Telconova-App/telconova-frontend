import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { Eye, EyeOff, UserPlus, Users, ArrowLeft } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();
  
  // User registration state
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  // Technician registration state
  const [techName, setTechName] = useState("");
  const [techEmail, setTechEmail] = useState("");
  const [techPhone, setTechPhone] = useState("");
  const [techSpecialty, setTechSpecialty] = useState("");
  const [techZone, setTechZone] = useState("");
  const [techLoading, setTechLoading] = useState(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName || !userRole || !userUsername || !userPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    if (userPassword !== userConfirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que las contraseñas sean iguales.",
        variant: "destructive",
      });
      return;
    }

    if (userPassword.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setUserLoading(true);

    try {
      await apiService.register({
        name: userName,
        role: userRole,
        username: userUsername,
        password: userPassword,
      });

      toast({
        title: "Usuario registrado",
        description: "El usuario ha sido registrado exitosamente.",
      });

      // Clear form
      setUserName("");
      setUserRole("");
      setUserUsername("");
      setUserPassword("");
      setUserConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error al registrar",
        description: error.message || "Hubo un problema al registrar el usuario.",
        variant: "destructive",
      });
    } finally {
      setUserLoading(false);
    }
  };

  const handleTechnicianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!techName || !techEmail || !techPhone || !techSpecialty || !techZone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    setTechLoading(true);

    try {
      await apiService.registerTechnician({
        name: techName,
        email: techEmail,
        phone: techPhone,
        specialty: techSpecialty,
        zone: techZone,
      });

      toast({
        title: "Técnico registrado",
        description: "El técnico ha sido registrado exitosamente.",
      });

      // Clear form
      setTechName("");
      setTechEmail("");
      setTechPhone("");
      setTechSpecialty("");
      setTechZone("");
    } catch (error: any) {
      toast({
        title: "Error al registrar",
        description: error.message || "Hubo un problema al registrar el técnico.",
        variant: "destructive",
      });
    } finally {
      setTechLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Gestión de usuarios y técnicos</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al dashboard principal"
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl" role="main">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2" role="tablist" aria-label="Formularios de registro">
            <TabsTrigger value="users" className="gap-2" aria-label="Formulario de registro de usuarios">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Registrar Usuario
            </TabsTrigger>
            <TabsTrigger value="technicians" className="gap-2" aria-label="Formulario de registro de técnicos">
              <Users className="h-4 w-4" aria-hidden="true" />
              Registrar Técnico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" role="tabpanel" aria-label="Panel de registro de usuarios">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Registrar Nuevo Usuario</CardTitle>
                <CardDescription>
                  Crea un nuevo usuario del sistema con permisos específicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserSubmit} className="space-y-4" aria-label="Formulario de registro de usuario">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Nombre Completo</Label>
                    <Input
                      id="userName"
                      placeholder="Juan Pérez"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      disabled={userLoading}
                      aria-required="true"
                      aria-label="Campo de nombre completo del usuario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userRole">Rol</Label>
                    <Select value={userRole} onValueChange={setUserRole} disabled={userLoading}>
                      <SelectTrigger id="userRole" aria-required="true" aria-label="Selector de rol del usuario">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userUsername">Correo Electrónico</Label>
                    <Input
                      id="userUsername"
                      type="email"
                      placeholder="usuario@telconova.com"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      disabled={userLoading}
                      aria-required="true"
                      aria-label="Campo de correo electrónico del usuario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="userPassword"
                        type={showUserPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        disabled={userLoading}
                        aria-required="true"
                        aria-label="Campo de contraseña del usuario"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowUserPassword(!showUserPassword)}
                        disabled={userLoading}
                        aria-label={showUserPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showUserPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userConfirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="userConfirmPassword"
                        type={showUserConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={userConfirmPassword}
                        onChange={(e) => setUserConfirmPassword(e.target.value)}
                        disabled={userLoading}
                        aria-required="true"
                        aria-label="Campo de confirmación de contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowUserConfirmPassword(!showUserConfirmPassword)}
                        disabled={userLoading}
                        aria-label={showUserConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showUserConfirmPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={userLoading} aria-label="Enviar formulario de registro de usuario">
                    {userLoading ? "Registrando..." : "Registrar Usuario"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technicians" role="tabpanel" aria-label="Panel de registro de técnicos">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Registrar Nuevo Técnico</CardTitle>
                <CardDescription>
                  Agrega un nuevo técnico al sistema con su información de contacto y especialidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTechnicianSubmit} className="space-y-4" aria-label="Formulario de registro de técnico">
                  <div className="space-y-2">
                    <Label htmlFor="techName">Nombre Completo</Label>
                    <Input
                      id="techName"
                      placeholder="Carlos Rodríguez"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      disabled={techLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="techEmail">Correo Electrónico</Label>
                    <Input
                      id="techEmail"
                      type="email"
                      placeholder="tecnico@telconova.com"
                      value={techEmail}
                      onChange={(e) => setTechEmail(e.target.value)}
                      disabled={techLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="techPhone">Teléfono</Label>
                    <Input
                      id="techPhone"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={techPhone}
                      onChange={(e) => setTechPhone(e.target.value)}
                      disabled={techLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="techSpecialty">Especialidad</Label>
                    <Select value={techSpecialty} onValueChange={setTechSpecialty} disabled={techLoading}>
                      <SelectTrigger id="techSpecialty">
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fibra_optica">Fibra Óptica</SelectItem>
                        <SelectItem value="instalacion">Instalación</SelectItem>
                        <SelectItem value="reparacion">Reparación</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="techZone">Zona</Label>
                    <Select value={techZone} onValueChange={setTechZone} disabled={techLoading}>
                      <SelectTrigger id="techZone">
                        <SelectValue placeholder="Selecciona una zona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="sur">Sur</SelectItem>
                        <SelectItem value="este">Este</SelectItem>
                        <SelectItem value="oeste">Oeste</SelectItem>
                        <SelectItem value="centro">Centro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={techLoading} aria-label="Enviar formulario de registro de técnico">
                    {techLoading ? "Registrando..." : "Registrar Técnico"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
