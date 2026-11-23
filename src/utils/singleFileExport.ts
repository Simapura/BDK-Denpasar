export async function fetchSingleFileHtmlBundle(): Promise<string | null> {
  try {
    const response = await fetch('/simapura-bdk-denpasar-tunggal.html', { cache: 'no-store' });
    if (response.ok) {
      const text = await response.text();
      if (
        text.includes('<style>') &&
        text.includes('<script type="module">') &&
        !text.includes('/src/main.tsx')
      ) {
        return text;
      }
    }
    // Fallback when already opened standalone via file://
    const hasInlineStyle = Boolean(document.querySelector('head style'));
    const hasInlineModule = Boolean(document.querySelector('script[type="module"]:not([src])'));
    if (hasInlineStyle && hasInlineModule) {
      const cloned = document.documentElement.cloneNode(true) as HTMLElement;
      const clonedRoot = cloned.querySelector('#root');
      if (clonedRoot) clonedRoot.innerHTML = '';
      return `<!doctype html>\n${cloned.outerHTML}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function copyTextWithFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
