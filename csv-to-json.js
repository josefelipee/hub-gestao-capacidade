/**
 * Script para converter painels-template.csv em data/panels.json
 *
 * Como usar:
 * 1. Preencha o arquivo painels-template.csv
 * 2. Execute no terminal: node csv-to-json.js
 * 3. O arquivo data/panels.json sera atualizado
 * 4. Faca commit e push para publicar no GitHub Pages
 */

const fs = require('fs');
const path = require('path');

const CSV_FILE = 'painels-template.csv';
const JSON_FILE = path.join('data', 'panels.json');

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headers = parseLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseLine(line);
    const row = {};
    let hasData = false;

    headers.forEach((header, index) => {
      const value = values[index] !== undefined ? values[index].trim() : '';
      row[header] = value;
      if (value) hasData = true;
    });

    if (hasData) rows.push(row);
  }

  return rows;
}

function parseLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function main() {
  if (!fs.existsSync(CSV_FILE)) {
    console.error(`Arquivo nao encontrado: ${CSV_FILE}`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(CSV_FILE, 'utf8');
  const rows = parseCSV(csvText);

  const panels = rows.map(row => ({
    id: row.id || `painel-${Math.random().toString(36).substr(2, 9)}`,
    title: row.title || '',
    category: row.category || '',
    description: row.description || '',
    icon: row.icon || 'chart-bar',
    originalUrl: row.originalUrl || ''
  }));

  fs.writeFileSync(JSON_FILE, JSON.stringify(panels, null, 2), 'utf8');

  console.log(`✓ ${panels.length} paineis convertidos com sucesso.`);
  console.log(`✓ Arquivo atualizado: ${JSON_FILE}`);
  console.log('\nProximos passos:');
  console.log('  git add data/panels.json');
  console.log('  git commit -m "atualiza paineis"');
  console.log('  git push origin master');
}

main();
