import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, Plus, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PriceHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState<string>("");

  const { data: history, isLoading } = trpc.history.list.useQuery({
    days: filterDays && filterDays !== "all" ? parseInt(filterDays) : undefined,
  });

  const { data: products } = trpc.products.list.useQuery();
  const { data: competitors } = trpc.competitors.list.useQuery();
  const exportPDFQuery = trpc.export.historyPDF.useQuery(
    { days: filterDays && filterDays !== "all" ? parseInt(filterDays) : undefined },
    { enabled: false }
  );
  const exportExcelQuery = trpc.export.historyExcel.useQuery(
    { days: filterDays && filterDays !== "all" ? parseInt(filterDays) : undefined },
    { enabled: false }
  );

  const filteredHistory = history?.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const formatPrice = (price: string | null | undefined) => {
    if (!price || price === "0") return "-";
    return `R$ ${parseFloat(price).toFixed(2).replace(".", ",")}`;
  };

  const getChangeIcon = (changeType: string) => {
    if (changeType === "created") {
      return <Plus className="w-4 h-4 text-green-600" />;
    } else if (changeType === "updated") {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    } else {
      return <ArrowDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getChangeLabel = (changeType: string) => {
    if (changeType === "created") return "Criado";
    if (changeType === "updated") return "Atualizado";
    return "Removido";
  };

  const getChangeColor = (changeType: string) => {
    if (changeType === "created") return "bg-green-50 border-green-200";
    if (changeType === "updated") return "bg-blue-50 border-blue-200";
    return "bg-red-50 border-red-200";
  };

  const handleExportPDF = async () => {
    try {
      const result = await exportPDFQuery.refetch();
      if (result.data?.data) {
        const binary = atob(result.data.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("PDF exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const result = await exportExcelQuery.refetch();
      if (result.data?.data) {
        const binary = atob(result.data.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Excel exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar Excel");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Preços</h1>
          <p className="text-gray-600 mt-2">Rastreie todas as alterações de preços ao longo do tempo</p>
        </div>

        {/* Filters and Export */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Buscar Produto</label>
            <Input
              placeholder="Nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Período</label>
            <Select value={filterDays} onValueChange={setFilterDays}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Todos os períodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Exportar</label>
            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                disabled={exportPDFQuery.isFetching || isLoading}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                {exportPDFQuery.isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    PDF
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </>
                )}
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={exportExcelQuery.isFetching || isLoading}
                variant="outline"
                className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
              >
                {exportExcelQuery.isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excel
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Alterações Registradas</CardTitle>
            <CardDescription>
              Total: {filteredHistory.length} alteração(ões)
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? "Nenhuma alteração encontrada" : "Nenhum histórico disponível"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${getChangeColor(
                      item.changeType
                    )}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getChangeIcon(item.changeType)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                          <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-current opacity-70">
                            {item.competitorName}
                          </span>
                          <span className="text-xs font-medium px-2 py-1 bg-white rounded">
                            {getChangeLabel(item.changeType)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm">
                          {item.previousValue && (
                            <div>
                              <span className="text-gray-600">Anterior: </span>
                              <span className="font-medium text-gray-900">
                                {formatPrice(item.previousValue)}
                              </span>
                            </div>
                          )}

                          {item.newValue && item.newValue !== "0" && (
                            <div>
                              <span className="text-gray-600">Novo: </span>
                              <span className="font-medium text-gray-900">
                                {formatPrice(item.newValue)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(item.changedAt).toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-md bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Sobre o Histórico</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-800 text-sm space-y-2">
            <p>
              O histórico registra automaticamente todas as alterações de preços:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Criado:</strong> Quando um novo preço é registrado</li>
              <li><strong>Atualizado:</strong> Quando um preço existente é modificado</li>
              <li><strong>Removido:</strong> Quando um preço é deletado</li>
            </ul>
            <p className="mt-3">
              Você pode filtrar o histórico por período para análise de tendências e exportar os dados em PDF ou Excel.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
