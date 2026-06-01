const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, '../_assets/Serviços+e+Produtos.csv');
const jsonFilePath = path.join(__dirname, '../data/servicos.json');

const servicos = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    if (data['Status'] !== 'PUBLISHED') return;

    const title = data['Nome do Serviço ou Produto'] || data['Title'] || '';
    if (!title || title.trim() === '') return;

    let tags = [];
    try {
      tags = JSON.parse(data['Tags'] || '[]');
    } catch (e) {
      console.warn(`Failed to parse tags for ${title}`);
    }

    servicos.push({
      id: data['ID'],
      title: title.trim(),
      description: data['Descrição'] || '',
      tags: tags
    });
  })
  .on('end', () => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(servicos, null, 2));
    console.log(`Successfully migrated ${servicos.length} services to ${jsonFilePath}`);
  });
