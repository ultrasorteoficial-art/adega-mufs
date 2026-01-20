import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wine, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [clientCode, setClientCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [skus, setSkus] = useState<Array<{ code: string; name: string }>>([
    { code: "", name: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const clientMutation = trpc.clients.getOrCreate.useMutation();
  const skuMutation = trpc.skus.create.useMutation();

  const handleAddSKU = () => {
    if (skus.length < 10) {
      setSkus([...skus, { code: "", name: "" }]);
    }
  };

  const handleRemoveSKU = (index: number) => {
    setSkus(skus.filter((_, i) => i !== index));
  };

  const handleSKUChange = (index: number, field: "code" | "name", value: string) => {
    const newSkus = [...skus];
    newSkus[index][field] = value;
    setSkus(newSkus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!clientCode.trim()) {
        toast.error("Código do cliente é obrigatório");
        setIsLoading(false);
        return;
      }

      if (!clientName.trim()) {
        toast.error("Nome do cliente é obrigatório");
        setIsLoading(false);
        return;
      }

      const validSkus = skus.filter((s) => s.code.trim() || s.name.trim());
      if (validSkus.length === 0) {
        toast.error("Adicione pelo menos um SKU");
        setIsLoading(false);
        return;
      }

      // Create or get client
      const clientResult = await clientMutation.mutateAsync({
        code: clientCode,
        name: clientName,
      });

      if (!clientResult.client) {
        toast.error("Erro ao criar cliente");
        setIsLoading(false);
        return;
      }

      // Create SKUs
      for (let i = 0; i < validSkus.length; i++) {
        const sku = validSkus[i];
        await skuMutation.mutateAsync({
          clientId: clientResult.client.id,
          code: sku.code,
          name: sku.name,
          order: i + 1,
        });
      }

      toast.success("Cliente e SKUs criados com sucesso!");

      // Redirect to register price page
      setLocation("/registrar-precos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar dados");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-full p-2">
              <Wine className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Adega Mufs</h1>
          </div>
          <p className="text-sm text-gray-600">Monitoramento de Concorrência</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <CardTitle>Cadastro de Cliente e SKUs</CardTitle>
            <CardDescription>
              Preencha os dados do cliente e seus 10 principais SKUs para começar
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Código do Cliente *
                  </label>
                  <Input
                    placeholder="Ex: CLI001"
                    value={clientCode}
                    onChange={(e) => setClientCode(e.target.value)}
                    disabled={isLoading}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nome do Cliente *
                  </label>
                  <Input
                    placeholder="Ex: Supermercado XYZ"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={isLoading}
                    className="border-gray-200"
                  />
                </div>
              </div>

              {/* SKUs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Principais SKUs ({skus.length}/10)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSKU}
                    disabled={skus.length >= 10 || isLoading}
                    className="border-amber-200 hover:bg-amber-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar SKU
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {skus.map((sku, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-gray-600">
                          Código SKU {index + 1}
                        </label>
                        <Input
                          placeholder="Ex: SKU001"
                          value={sku.code}
                          onChange={(e) =>
                            handleSKUChange(index, "code", e.target.value)
                          }
                          disabled={isLoading}
                          className="border-gray-200 text-sm"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-gray-600">
                          Nome SKU {index + 1}
                        </label>
                        <Input
                          placeholder="Ex: Cerveja Premium 600ml"
                          value={sku.name}
                          onChange={(e) =>
                            handleSKUChange(index, "name", e.target.value)
                          }
                          disabled={isLoading}
                          className="border-gray-200 text-sm"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSKU(index)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Prosseguir para Registro de Preços
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-900">
              <strong>ℹ️ Informação:</strong> Após preencher os dados do cliente e SKUs, você será redirecionado para
              registrar os preços dos concorrentes (Dinho, Adega Brasil, Franco, Diversos) e anexar evidências.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
