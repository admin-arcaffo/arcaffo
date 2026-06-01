const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, '../_assets/Vagas+Arcaffo.csv');
const jsonFilePath = path.join(__dirname, '../data/vagas.json');

const vagas = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    if (data['Status'] !== 'PUBLISHED') return;

    // Search for title across all possible column names due to BOM or encoding
    let title = '';
    for (const key in data) {
      if (key.toLowerCase().includes('tulo') || key.toLowerCase().includes('title') || key.toLowerCase().includes('vaga')) {
        if (!key.toLowerCase().includes('status')) {
            title = data[key];
            break;
        }
      }
    }

    if (!title || title.trim() === '') return;

    vagas.push({
      id: data['ID'],
      title: title.trim(),
      regime: data['Regime/Cargo'] || '',
      perfil: data['Perfil'] || '',
      sobre: data['Sobre a vaga'] || '',
      quem_e_voce: data['Quem você é'] || '',
      o_que_buscamos: data['O que buscamos'] || '',
      publishDate: data['Publish Date'] || ''
    });
  })
  .on('end', () => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(vagas, null, 2));
    console.log(`Successfully migrated ${vagas.length} jobs to ${jsonFilePath}`);
  });
