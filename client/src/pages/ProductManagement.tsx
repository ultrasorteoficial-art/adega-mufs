import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Loader2, Trash2, Edit2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductManagement() {
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!newProductName.trim()) {
      setError("Nome do produto é obrigatório");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        name: newProductName,
        category: newProductCategory || undefined,
      });

      setNewProductName("");
      setNewProductCategory("");
      setSuccess(true);
      toast.success("Produto criado com sucesso!");
      refetch();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao criar produto");
      toast.error("Erro ao criar produto");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProductMutation.mutateAsync({ id: productId });
      toast.success("Produto removido com sucesso!");
      setDeleteConfirm(null);
      refetch();
    } catch (err: any) {
      toast.error("Erro ao remover produto");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Produtos</h1>
          <p className="text-gray-600 mt-2">Adicione, edite ou remova produtos do catálogo</p>
        </div>

        {/* Create Product Card */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Novo Produto</CardTitle>
            <CardDescription>Adicione um novo produto ao sistema</CardDescription>
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
                  Produto criado com sucesso!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome do Produto *</label>
                  <Input
                    placeholder="Ex: Smirnoff Ice Lata"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoria</label>
                  <Input
                    placeholder="Ex: Bebidas Alcoólicas"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="border-gray-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createProductMutation.isPending || !newProductName.trim()}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Produto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Produtos Cadastrados</CardTitle>
            <CardDescription>
              Total: {products?.length || 0} produto(s)
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.category && (
                        <p className="text-sm text-gray-500">{product.category}</p>
                      )}
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Produto</DialogTitle>
                            <DialogDescription>
                              Funcionalidade de edição em desenvolvimento
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={deleteConfirm === product.id} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar Exclusão</DialogTitle>
                            <DialogDescription>
                              Tem certeza que deseja remover o produto "{product.name}"? Esta ação não pode ser desfeita.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              {deleteProductMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Removendo...
                                </>
                              ) : (
                                "Remover"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum produto cadastrado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
