import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, TrendingDown, TrendingUp, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PriceComparison() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: comparison, isLoading } = trpc.prices.getComparison.useQuery();
  const exportPDFQuery = trpc.export.comparisonPDF.useQuery(undefined, { enabled: false });
  const exportExcelQuery = trpc.export.comparisonExcel.useQuery(undefined, { enabled: false });

  const filteredComparison = comparison?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return "-";
    return `R$ ${parseFloat(price).toFixed(2).replace(".", ",")}`;
  };

  const getPriceVariation = (price: string | null | undefined, average: string | null | undefined) => {
    if (!price || !average) return null;
    const p = parseFloat(price);
    const a = parseFloat(average);
    const variation = ((p - a) / a) * 100;
    return variation;
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
          <h1 className="text-3xl font-bold text-gray-900">Comparação de Preços</h1>
          <p className="text-gray-600 mt-2">Análise comparativa de preços entre concorrentes</p>
        </div>

        {/* Search and Export */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="max-w-md flex-1">
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              disabled={exportPDFQuery.isFetching || isLoading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {exportPDFQuery.isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
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
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              {exportExcelQuery.isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
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

        {/* Comparison Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle>Tabela de Preços</CardTitle>
            <CardDescription>
              Preços atuais de todos os concorrentes por produto
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredComparison.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">
                  {searchTerm ? "Nenhum produto encontrado" : "Nenhum preço registrado ainda"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dinho</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Adega Brasil</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Franco</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Diversos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Média</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComparison.map((product, index) => {
                      const competitors = ["Dinho", "Adega Brasil", "Franco", "Diversos"];
                      const average = product.average;

                      return (
                        <tr
                          key={product.id}
                          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>

                          {competitors.map((competitor) => {
                            const price = product.competitorPrices[competitor];
                            const variation = getPriceVariation(price?.value, average);

                            return (
                              <td key={competitor} className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 font-medium">
                                    {formatPrice(price?.value)}
                                  </span>
                                  {variation !== null && (
                                    <span
                                      className={`text-xs font-semibold flex items-center gap-1 ${
                                        variation > 0 ? "text-red-600" : "text-green-600"
                                      }`}
                                    >
                                      {variation > 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                      {Math.abs(variation).toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          <td className="px-6 py-4 text-sm">
                            <span className="font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                              {formatPrice(average)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {product.lastUpdated
                              ? new Date(product.lastUpdated).toLocaleDateString("pt-BR")
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm space-y-2">
            <p>
              <strong>Média:</strong> Preço médio praticado por todos os concorrentes para este produto
            </p>
            <p>
              <strong>Variação:</strong> Percentual de diferença do preço do concorrente em relação à média
            </p>
            <p>
              <strong>Atualizado:</strong> Data da última atualização de qualquer preço deste produto
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
