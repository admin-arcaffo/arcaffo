const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../');
const files = ['index.html', 'sobre.html', 'servicos.html', 'projetos.html', 'artigos.html', 'artigo.html', 'contato.html'];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "Escola de Negócios (ENM)" -> "Escola de Negócios"
    content = content.replace(/>Escola de Negócios \(ENM\)<\/a>/g, '>Escola de Negócios</a>');
    
    // Replace "Clube Empresarial (Ordo)" -> "Clube Empresarial"
    content = content.replace(/>Clube Empresarial \(Ordo\)<\/a>/g, '>Clube Empresarial</a>');
    
    // Replace Serviços link
    // It might be <a href="/servicos.html">Serviços</a> or <a href="/servicos.html" class="active">Serviços</a>
    content = content.replace(/<a href="\/servicos\.html"([^>]*)>Serviços<\/a>/g, '<a href="https://advisor.arcaffo.com" target="_blank" rel="noopener"$1>Assessoria</a>');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  }
}
