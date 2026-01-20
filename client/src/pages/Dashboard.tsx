import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Package, Users, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: comparison, isLoading: comparisonLoading } = trpc.prices.getComparison.useQuery();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: competitors } = trpc.competitors.list.useQuery();

  const stats = {
    products: products?.length || 0,
    competitors: competitors?.length || 0,
    lastUpdated: comparison?.[0]?.lastUpdated ? new Date(comparison[0].lastUpdated).toLocaleDateString('pt-BR') : "-",
    averagePrice: comparison && comparison.length > 0
      ? (comparison.reduce((sum, p) => sum + (parseFloat(p.average || "0")), 0) / comparison.length).toFixed(2)
      : "0",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Visão geral do monitoramento de concorrência</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Produtos</CardTitle>
              <Package className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{stats.products}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Produtos monitorados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Concorrentes</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.competitors}</div>
              <p className="text-xs text-gray-500 mt-1">Concorrentes rastreados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Preço Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {comparisonLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">R$ {stats.averagePrice}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Média geral</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Atualizado</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 truncate">{stats.lastUpdated}</div>
              <p className="text-xs text-gray-500 mt-1">Última atualização</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Produtos Monitorados</CardTitle>
            <CardDescription>
              Últimos produtos adicionados ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comparisonLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : comparison && comparison.length > 0 ? (
              <div className="space-y-3">
                {comparison.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setLocation("/comparison")}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Preço médio: <span className="font-semibold text-gray-900">R$ {product.average}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {Object.values(product.competitorPrices).filter(p => p !== null).length} concorrentes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum produto registrado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/prices")}>
            <CardHeader>
              <CardTitle className="text-lg">Registrar Preço</CardTitle>
              <CardDescription>Adicionar novo preço de concorrente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">+</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/products")}>
            <CardHeader>
              <CardTitle className="text-lg">Gerenciar Produtos</CardTitle>
              <CardDescription>Adicionar ou editar produtos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">⚙️</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
