import XLSX from "xlsx";

export interface ComparisonData {
  id: number;
  name: string;
  average: string | null;
  competitorPrices: {
    [key: string]: { value: string | null; updatedAt: Date } | null;
  };
  lastUpdated: Date | null;
}

export function generateComparisonExcel(
  products: ComparisonData[],
  generatedAt: Date = new Date()
): Buffer {
  const workbook = XLSX.utils.book_new();

  // Prepare data for the sheet
  const sheetData: any[] = [];

  // Add title and metadata
  sheetData.push(["Adega Mufs - Relatório de Comparação de Preços"]);
  sheetData.push([`Gerado em: ${generatedAt.toLocaleDateString("pt-BR")} às ${generatedAt.toLocaleTimeString("pt-BR")}`]);
  sheetData.push([]);

  // Add summary
  const validProducts = products.filter((p) => p.competitorPrices);
  const avgPrice =
    validProducts.length > 0
      ? (validProducts.reduce((sum, p) => sum + parseFloat(p.average || "0"), 0) / validProducts.length).toFixed(2)
      : "0";

  sheetData.push(["Resumo Executivo"]);
  sheetData.push(["Total de Produtos", validProducts.length]);
  sheetData.push(["Preço Médio Geral", `R$ ${parseFloat(avgPrice).toFixed(2).replace(".", ",")}`]);
  sheetData.push(["Data do Relatório", generatedAt.toLocaleDateString("pt-BR")]);
  sheetData.push([]);

  // Add table header
  sheetData.push(["Produto", "Dinho", "Adega Brasil", "Franco", "Diversos", "Média", "Última Atualização"]);

  // Add products
  products.forEach((product) => {
    const row = [
      product.name,
      product.competitorPrices["Dinho"]?.value
        ? `R$ ${parseFloat(product.competitorPrices["Dinho"].value).toFixed(2).replace(".", ",")}`
        : "-",
      product.competitorPrices["Adega Brasil"]?.value
        ? `R$ ${parseFloat(product.competitorPrices["Adega Brasil"].value).toFixed(2).replace(".", ",")}`
        : "-",
      product.competitorPrices["Franco"]?.value
        ? `R$ ${parseFloat(product.competitorPrices["Franco"].value).toFixed(2).replace(".", ",")}`
        : "-",
      product.competitorPrices["Diversos"]?.value
        ? `R$ ${parseFloat(product.competitorPrices["Diversos"].value).toFixed(2).replace(".", ",")}`
        : "-",
      `R$ ${parseFloat(product.average || "0").toFixed(2).replace(".", ",")}`,
      product.lastUpdated ? new Date(product.lastUpdated).toLocaleDateString("pt-BR") : "-",
    ];
    sheetData.push(row);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Produto
    { wch: 15 }, // Dinho
    { wch: 15 }, // Adega Brasil
    { wch: 15 }, // Franco
    { wch: 15 }, // Diversos
    { wch: 15 }, // Média
    { wch: 18 }, // Última Atualização
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Comparação");

  // Generate buffer
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function generateHistoryExcel(
  history: Array<{
    id: number;
    productName: string;
    competitorName: string;
    changeType: string;
    previousValue: string | null;
    newValue: string | null;
    changedAt: Date;
  }>,
  generatedAt: Date = new Date()
): Buffer {
  const workbook = XLSX.utils.book_new();

  // Prepare data for the sheet
  const sheetData: any[] = [];

  // Add title and metadata
  sheetData.push(["Adega Mufs - Relatório de Histórico de Preços"]);
  sheetData.push([`Gerado em: ${generatedAt.toLocaleDateString("pt-BR")} às ${generatedAt.toLocaleTimeString("pt-BR")}`]);
  sheetData.push([]);

  // Add summary
  sheetData.push(["Resumo Executivo"]);
  sheetData.push(["Total de Alterações", history.length]);
  if (history.length > 0) {
    sheetData.push([
      "Período",
      `${new Date(history[history.length - 1].changedAt).toLocaleDateString("pt-BR")} a ${new Date(history[0].changedAt).toLocaleDateString("pt-BR")}`,
    ]);
  }
  sheetData.push([]);

  // Add table header
  sheetData.push(["Produto", "Concorrente", "Tipo de Alteração", "Valor Anterior", "Novo Valor", "Data e Hora"]);

  // Add history items
  history.forEach((item) => {
    const changeLabel =
      item.changeType === "created"
        ? "Criado"
        : item.changeType === "updated"
          ? "Atualizado"
          : "Removido";

    const prevValue = item.previousValue ? `R$ ${parseFloat(item.previousValue).toFixed(2).replace(".", ",")}` : "-";
    const newValue = item.newValue && item.newValue !== "0" ? `R$ ${parseFloat(item.newValue).toFixed(2).replace(".", ",")}` : "-";

    const row = [
      item.productName,
      item.competitorName,
      changeLabel,
      prevValue,
      newValue,
      new Date(item.changedAt).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ];
    sheetData.push(row);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Produto
    { wch: 20 }, // Concorrente
    { wch: 18 }, // Tipo de Alteração
    { wch: 15 }, // Valor Anterior
    { wch: 15 }, // Novo Valor
    { wch: 20 }, // Data e Hora
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Histórico");

  // Generate buffer
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
