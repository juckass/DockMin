// Utilidad para parsear salidas tipo tabla (como docker compose ps, docker ps, etc.)
interface TableColumn {
  name: string;
  start: number;
  end?: number; // Puede ser undefined para la última columna
}

export function parseTableOutput(output: string): Array<Record<string, string>> {
  const lines = output.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  // Detectar columnas por los espacios de la cabecera
  const headerLine = lines[0];
  const columns: TableColumn[] = [];
  let colStart = 0;
  for (let i = 1; i < headerLine.length; i++) {
    if (headerLine[i] !== ' ' && headerLine[i - 1] === ' ') {
      columns.push({
        name: headerLine.slice(colStart, i).trim(),
        start: colStart,
        end: i
      });
      colStart = i;
    }
  }
  // La última columna toma hasta el final de la línea
  columns.push({
    name: headerLine.slice(colStart).trim(),
    start: colStart,
    end: undefined
  });

  // Parsear cada fila
  const result = lines.slice(1).map(line => {
    const obj: Record<string, string> = {};
    columns.forEach((col, idx) => {
      const value = col.end !== undefined
        ? line.slice(col.start, col.end).trim()
        : line.slice(col.start).trim();
      obj[col.name || `col${idx}`] = value;
    });
    return obj;
  });
  return result;
}
