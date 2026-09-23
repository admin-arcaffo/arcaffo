import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const articles = JSON.parse(readFileSync('public/data/artigos.json', 'utf8'));
const social = JSON.parse(readFileSync('social/instagram/content.json', 'utf8'));

test('new articles include Instagram content with caption and a complete format', () => {
  const required = articles.filter(article => article.status === 'published' && article.date >= social.standardSince);
  assert.ok(required.length > 0);
  for (const article of required) {
    const entry = social.articles[article.slug];
    assert.ok(entry, `${article.slug}: conteúdo social ausente`);
    assert.ok(entry.caption?.length >= 200, `${article.slug}: legenda curta ou ausente`);
    assert.ok(entry.carousel?.length >= 5 || entry.fixedPost, `${article.slug}: falta carrossel ou post fixo`);
    if (entry.stories) assert.ok(entry.stories.length >= 3, `${article.slug}: sequência de Stories incompleta`);
  }
});
