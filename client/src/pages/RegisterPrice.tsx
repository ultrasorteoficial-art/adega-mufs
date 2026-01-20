import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function RegisterPrice() {
  const [productId, setProductId] = useState("");
  const [competitorId, setCompetitorId] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: products } = trpc.products.list.useQuery();
  const { data: competitors } = trpc.competitors.list.useQuery();
  const registerPriceMutation = trpc.prices.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!productId || !competitorId || !value) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    try {
      await registerPriceMutation.mutateAsync({
        productId: parseInt(productId),
        competitorId: parseInt(competitorId),
        value,
      });

      setSuccess(true);
      setProductId("");
      setCompetitorId("");
      setValue("");
      toast.success("Preço registrado com sucesso!");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao registrar preço");
      toast.error("Erro ao registrar preço");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Preço</h1>
          <p className="text-gray-600 mt-2">Adicione um novo preço de um concorrente</p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-md max-w-2xl">
          <CardHeader>
            <CardTitle>Novo Registro de Preço</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para registrar o preço de um produto em um concorrente
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Preço registrado com sucesso!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Produto</label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {products?.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Nenhum produto cadastrado. Adicione um produto primeiro.
                  </p>
                )}
              </div>

              {/* Competitor Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Concorrente</label>
                <Select value={competitorId} onValueChange={setCompetitorId}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Selecione um concorrente" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitors?.map((competitor) => (
                      <SelectItem key={competitor.id} value={competitor.id.toString()}>
                        {competitor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={registerPriceMutation.isPending || !productId || !competitorId || !value}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {registerPriceMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Preço"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Dica</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <p>
              Cada vez que você registra um preço, o sistema automaticamente:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Atualiza o preço atual se já existir um registro</li>
              <li>Mantém o histórico de todas as alterações</li>
              <li>Recalcula a média de preços para o produto</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
