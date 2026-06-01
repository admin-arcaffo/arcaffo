export function initRichEditor(containerId, initialContent = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const html = `
    <div class="rich-editor-wrapper" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-dark);">
      <div class="rich-toolbar" style="background: var(--bg-card); padding: 0.5rem; display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color);">
        <button type="button" class="rich-btn" data-command="formatBlock" data-value="H2" title="Título 2"><b>H2</b></button>
        <button type="button" class="rich-btn" data-command="formatBlock" data-value="H3" title="Título 3"><b>H3</b></button>
        <div style="width: 1px; background: var(--border-color); margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="bold" title="Negrito"><b>B</b></button>
        <button type="button" class="rich-btn" data-command="italic" title="Itálico"><i>I</i></button>
        <button type="button" class="rich-btn" data-command="strikeThrough" title="Tachado"><strike>S</strike></button>
        <div style="width: 1px; background: var(--border-color); margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="insertUnorderedList" title="Lista">UL</button>
        <button type="button" class="rich-btn" data-command="insertOrderedList" title="Lista Numérica">OL</button>
        <div style="width: 1px; background: var(--border-color); margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="createLink" title="Inserir Link">Link</button>
        <button type="button" class="rich-btn" data-command="insertHorizontalRule" title="Linha">HR</button>
      </div>
      <div class="rich-content" contenteditable="true" style="padding: 1rem; min-height: 400px; outline: none; line-height: 1.6;">
        ${initialContent}
      </div>
    </div>
  `;
  
  container.innerHTML = html;

  const contentArea = container.querySelector('.rich-content');
  const buttons = container.querySelectorAll('.rich-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      let value = btn.dataset.value || null;

      if (command === 'createLink') {
        value = prompt('Digite a URL:');
        if (!value) return;
      }

      document.execCommand(command, false, value);
      contentArea.focus();
    });
  });

  return {
    getContent: () => contentArea.innerHTML,
    setContent: (html) => contentArea.innerHTML = html
  };
}
