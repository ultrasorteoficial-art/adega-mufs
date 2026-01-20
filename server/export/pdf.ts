import PDFDocument from "pdfkit";

export interface ComparisonData {
  id: number;
  name: string;
  average: string | null;
  competitorPrices: {
    [key: string]: { value: string | null; updatedAt: Date } | null;
  };
  lastUpdated: Date | null;
}

export async function generateComparisonPDF(
  products: ComparisonData[],
  generatedAt: Date = new Date()
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Adega Mufs", { align: "center" });

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Relatório de Comparação de Preços", { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Gerado em: ${generatedAt.toLocaleDateString("pt-BR")} às ${generatedAt.toLocaleTimeString("pt-BR")}`, {
        align: "center",
      });

    doc.moveDown(0.5);

    // Summary
    const validProducts = products.filter((p) => p.competitorPrices);
    const avgPrice =
      validProducts.length > 0
        ? (validProducts.reduce((sum, p) => sum + parseFloat(p.average || "0"), 0) / validProducts.length).toFixed(2)
        : "0";

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Resumo Executivo", { underline: true });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Total de Produtos: ${validProducts.length}`)
      .text(`Preço Médio Geral: R$ ${parseFloat(avgPrice).toFixed(2).replace(".", ",")}`)
      .text(`Data do Relatório: ${generatedAt.toLocaleDateString("pt-BR")}`);

    doc.moveDown(1);

    // Table Header
    const pageWidth = (doc.page as any).width - 80;
    const colWidth = pageWidth / 5;
    const startX = 40;
    const startY = doc.y;

    const headers = ["Produto", "Dinho", "Adega Brasil", "Franco", "Diversos"];
    const competitors = ["Dinho", "Adega Brasil", "Franco", "Diversos"];

    // Draw table header
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#333333");

    let xPos = startX;
    headers.forEach((header) => {
      doc.text(header, xPos, startY, {
        width: colWidth,
        align: "center",
        ellipsis: true,
      });
      xPos += colWidth;
    });

    // Draw header underline
    doc
      .moveTo(startX, startY + 15)
      .lineTo(startX + pageWidth, startY + 15)
      .stroke();

    // Draw table rows
    let yPos = startY + 25;
    const rowHeight = 20;

    doc.fontSize(8).font("Helvetica");

    products.forEach((product, index) => {
      // Check if we need a new page
      if (yPos > (doc.page as any).height - 60) {
        doc.addPage();
        yPos = 40;

        // Redraw header on new page
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#333333");

        xPos = startX;
        headers.forEach((header) => {
          doc.text(header, xPos, yPos, {
            width: colWidth,
            align: "center",
            ellipsis: true,
          });
          xPos += colWidth;
        });

        doc
          .moveTo(startX, yPos + 15)
          .lineTo(startX + pageWidth, yPos + 15)
          .stroke();

        yPos += 25;
        doc.fontSize(8).font("Helvetica");
      }

      // Product name
      doc.fillColor("#000000");
      doc.text(product.name, startX, yPos, {
        width: colWidth,
        align: "left",
        ellipsis: true,
      });

      // Competitor prices
      xPos = startX + colWidth;
      competitors.forEach((competitor) => {
        const price = product.competitorPrices[competitor];
        const priceText = price?.value ? `R$ ${parseFloat(price.value).toFixed(2).replace(".", ",")}` : "-";

        doc.text(priceText, xPos, yPos, {
          width: colWidth,
          align: "center",
          ellipsis: true,
        });

        xPos += colWidth;
      });

      yPos += rowHeight;
    });

    // Footer
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Relatório confidencial - Adega Mufs", 40, (doc.page as any).height - 30, {
        align: "center",
      });

    doc.end();
  });
}

export async function generateHistoryPDF(
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
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Adega Mufs", { align: "center" });

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Relatório de Histórico de Preços", { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Gerado em: ${generatedAt.toLocaleDateString("pt-BR")} às ${generatedAt.toLocaleTimeString("pt-BR")}`, {
        align: "center",
      });

    doc.moveDown(0.5);

    // Summary
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Resumo Executivo", { underline: true });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Total de Alterações: ${history.length}`)
      .text(
        `Período: ${history.length > 0 ? new Date(history[history.length - 1].changedAt).toLocaleDateString("pt-BR") : "N/A"} a ${history.length > 0 ? new Date(history[0].changedAt).toLocaleDateString("pt-BR") : "N/A"}`
      );

    doc.moveDown(1);

    // Table Header
    const pageWidth = (doc.page as any).width - 80;
    const colWidths = [pageWidth * 0.25, pageWidth * 0.2, pageWidth * 0.15, pageWidth * 0.2, pageWidth * 0.2];
    const startX = 40;
    let startY = doc.y;

    const headers = ["Produto", "Concorrente", "Tipo", "Valor Anterior", "Novo Valor"];

    // Draw table header
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor("#333333");

    let xPos = startX;
    headers.forEach((header, idx) => {
      doc.text(header, xPos, startY, {
        width: colWidths[idx],
        align: "center",
        ellipsis: true,
      });
      xPos += colWidths[idx];
    });

    // Draw header underline
    doc
      .moveTo(startX, startY + 15)
      .lineTo(startX + pageWidth, startY + 15)
      .stroke();

    // Draw table rows
    let yPos = startY + 25;
    const rowHeight = 18;

    doc.fontSize(8).font("Helvetica");

    history.forEach((item) => {
      // Check if we need a new page
      if (yPos > (doc.page as any).height - 60) {
        doc.addPage();
        yPos = 40;

        // Redraw header on new page
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#333333");

        xPos = startX;
        headers.forEach((header, idx) => {
          doc.text(header, xPos, yPos, {
            width: colWidths[idx],
            align: "center",
            ellipsis: true,
          });
          xPos += colWidths[idx];
        });

        doc
          .moveTo(startX, yPos + 15)
          .lineTo(startX + pageWidth, yPos + 15)
          .stroke();

        yPos += 25;
        doc.fontSize(8).font("Helvetica");
      }

      doc.fillColor("#000000");

      // Product name
      doc.text(item.productName, startX, yPos, {
        width: colWidths[0],
        align: "left",
        ellipsis: true,
      });

      // Competitor
      xPos = startX + colWidths[0];
      doc.text(item.competitorName, xPos, yPos, {
        width: colWidths[1],
        align: "left",
        ellipsis: true,
      });

      // Change type
      xPos += colWidths[1];
      const changeLabel =
        item.changeType === "created"
          ? "Criado"
          : item.changeType === "updated"
            ? "Atualizado"
            : "Removido";
      doc.text(changeLabel, xPos, yPos, {
        width: colWidths[2],
        align: "center",
        ellipsis: true,
      });

      // Previous value
      xPos += colWidths[2];
      const prevValue = item.previousValue ? `R$ ${parseFloat(item.previousValue).toFixed(2).replace(".", ",")}` : "-";
      doc.text(prevValue, xPos, yPos, {
        width: colWidths[3],
        align: "center",
        ellipsis: true,
      });

      // New value
      xPos += colWidths[3];
      const newValue = item.newValue && item.newValue !== "0" ? `R$ ${parseFloat(item.newValue).toFixed(2).replace(".", ",")}` : "-";
      doc.text(newValue, xPos, yPos, {
        width: colWidths[4],
        align: "center",
        ellipsis: true,
      });

      yPos += rowHeight;
    });

    // Footer
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Relatório confidencial - Adega Mufs", 40, (doc.page as any).height - 30, {
        align: "center",
      });

    doc.end();
  });
}
