import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Wine, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();

  const demoUsers = [
    { email: "user1@adegamufs.com", name: "Usuário 1" },
    { email: "user2@adegamufs.com", name: "Usuário 2" },
    { email: "user3@adegamufs.com", name: "Usuário 3" },
    { email: "user4@adegamufs.com", name: "Usuário 4" },
    { email: "user5@adegamufs.com", name: "Usuário 5" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Por favor, insira um email");
      return;
    }

    if (!password) {
      setError("Por favor, insira uma senha");
      return;
    }

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success("Login realizado com sucesso!");
      // Reload page to update auth state
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Tente novamente.");
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword("123456");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-full p-3">
              <Wine className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Adega Mufs</h1>
          <p className="text-gray-600">Monitoramento de Concorrência</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Faça login com suas credenciais
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-gray-200"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Demo Users */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Usuários de Demonstração:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((user) => (
                  <Button
                    key={user.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickLogin(user.email)}
                    disabled={isLoading}
                    className="text-xs border-amber-200 hover:bg-amber-50"
                  >
                    {user.name}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Senha padrão: <strong>123456</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Sistema de Monitoramento de Preços</p>
          <p>Adega Mufs © 2026</p>
        </div>
      </div>
    </div>
  );
}
