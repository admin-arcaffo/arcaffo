export function initRichEditor(containerId, initialContent = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const html = `
    <div class="rich-editor-wrapper" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #FFFFFF; color: #1A1A1A;">
      <div class="rich-toolbar" style="background: #F7F7F7; padding: 0.5rem; display: flex; gap: 0.5rem; border-bottom: 1px solid #E0E0E0; flex-wrap: wrap;">
        <button type="button" class="rich-btn" data-command="formatBlock" data-value="H2" title="Título 2" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><b>H2</b></button>
        <button type="button" class="rich-btn" data-command="formatBlock" data-value="H3" title="Título 3" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><b>H3</b></button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="bold" title="Negrito" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><b>B</b></button>
        <button type="button" class="rich-btn" data-command="italic" title="Itálico" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><i>I</i></button>
        <button type="button" class="rich-btn" data-command="strikeThrough" title="Tachado" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><strike>S</strike></button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="insertUnorderedList" title="Lista" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">UL</button>
        <button type="button" class="rich-btn" data-command="insertOrderedList" title="Lista Numérica" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">OL</button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="createLink" title="Inserir Link" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">Link</button>
        <button type="button" class="rich-btn" data-command="insertHorizontalRule" title="Linha" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">HR</button>
      </div>
      <div class="rich-content" contenteditable="true" style="padding: 2rem; min-height: 400px; outline: none; line-height: 1.6; font-size: 1.1rem; font-family: 'Inter Tight', sans-serif;">
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
