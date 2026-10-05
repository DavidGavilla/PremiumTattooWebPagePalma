// Guided consultation: validates the form and builds a message the visitor sends
// themselves on Instagram. Nothing is transmitted from this page.
import type { Lang } from './data/content.ts';
import { strings } from './i18n.ts';

type FieldControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const REQUIRED_FIELDS = ['c-idea', 'c-zone', 'c-size'] as const;

interface ConsultData {
  readonly artist: string;
  readonly idea: string;
  readonly zone: string;
  readonly size: string;
  readonly dates: string;
}

function readField(form: HTMLFormElement, name: keyof ConsultData): string {
  const control = form.elements.namedItem(name);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
    return control.value.trim();
  }
  return '';
}

export function buildMessage(data: ConsultData, lang: Lang): string {
  const m = strings[lang].booking.message;
  const lines = [
    m.greeting,
    '',
    `${m.idea}: ${data.idea}`,
    `${m.zone}: ${data.zone}`,
    `${m.size}: ${data.size}`,
  ];
  if (data.dates) lines.push(`${m.dates}: ${data.dates}`);
  if (data.artist) lines.push(`${m.artist}: ${data.artist}`);
  return lines.join('\n');
}

function setFieldError(root: HTMLElement, id: string, message: string | null): void {
  const control = root.querySelector<FieldControl>(`#${id}`);
  const error = root.querySelector<HTMLElement>(`[data-error-for="${id}"]`);
  if (!control || !error) return;
  const help = root.querySelector(`#${id}-help`) ? `${id}-help` : '';
  if (message) {
    error.textContent = message;
    error.hidden = false;
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', [help, `${id}-error`].filter(Boolean).join(' '));
  } else {
    error.textContent = '';
    error.hidden = true;
    control.removeAttribute('aria-invalid');
    if (help) control.setAttribute('aria-describedby', help);
    else control.removeAttribute('aria-describedby');
  }
}

async function copyText(text: string, fallbackTarget: HTMLTextAreaElement): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    fallbackTarget.focus();
    fallbackTarget.select();
    return false;
  }
}

export function setupConsultForm(root: HTMLElement, lang: Lang): void {
  const form = root.querySelector<HTMLFormElement>('[data-consult-form]');
  const result = root.querySelector<HTMLElement>('[data-consult-result]');
  const output = root.querySelector<HTMLTextAreaElement>('[data-consult-message]');
  const status = root.querySelector<HTMLElement>('[data-copy-status]');
  const summary = root.querySelector<HTMLElement>('[data-form-error]');
  const copyButton = root.querySelector<HTMLButtonElement>('[data-copy-message]');
  if (!form || !result || !output || !status || !summary || !copyButton) return;
  const t = strings[lang].booking;

  form.addEventListener('input', (event) => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('aria-invalid') === 'true' && (target as FieldControl).value.trim()) {
      setFieldError(root, target.id, null);
      if (!form.querySelector('[aria-invalid="true"]')) summary.hidden = true;
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const missing = REQUIRED_FIELDS.filter((id) => !root.querySelector<FieldControl>(`#${id}`)?.value.trim());
    REQUIRED_FIELDS.forEach((id) => setFieldError(root, id, missing.includes(id) ? t.required : null));
    if (missing.length > 0) {
      summary.hidden = false;
      root.querySelector<FieldControl>(`#${missing[0]}`)?.focus();
      return;
    }
    summary.hidden = true;
    output.value = buildMessage(
      {
        artist: readField(form, 'artist'),
        idea: readField(form, 'idea'),
        zone: readField(form, 'zone'),
        size: readField(form, 'size'),
        dates: readField(form, 'dates'),
      },
      lang,
    );
    status.textContent = '';
    result.hidden = false;
    output.focus();
  });

  copyButton.addEventListener('click', async () => {
    const copied = await copyText(output.value, output);
    status.textContent = copied ? t.copied : t.copyFailed;
  });
}
