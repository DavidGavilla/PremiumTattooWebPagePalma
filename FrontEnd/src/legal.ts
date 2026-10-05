// Legal page TEMPLATES (Spain: LSSI-CE, RGPD/LOPDGDD). Pre-rendered by vite.config.ts.
// PENDING LEGAL REVIEW: every [BRACKETED] value must come from the studio, and the
// text must be reviewed before publishing. Spanish only, as required for Spain.
import { studio } from './data/content.ts';
import { escapeHtml as e } from './render.ts';

export type LegalPage = 'aviso-legal' | 'privacidad' | 'cookies';

interface LegalSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

interface LegalDoc {
  readonly title: string;
  readonly sections: readonly LegalSection[];
}

const OWNER = '[NOMBRE O RAZÓN SOCIAL DEL TITULAR]';
const NIF = '[NIF / CIF]';
const FISCAL_ADDRESS = '[DOMICILIO FISCAL]';
const EMAIL = '[CORREO ELECTRÓNICO DE CONTACTO]';
const LAST_UPDATE = '[FECHA DE ÚLTIMA ACTUALIZACIÓN]';

const docs: Readonly<Record<LegalPage, LegalDoc>> = {
  'aviso-legal': {
    title: 'Aviso legal',
    sections: [
      {
        heading: 'Titular del sitio web',
        paragraphs: [
          `En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este sitio web pertenece a ${OWNER}, con NIF ${NIF} y domicilio en ${FISCAL_ADDRESS}.`,
          `Establecimiento: ${studio.name}, ${studio.street}, ${studio.postalCode} ${studio.locality} (${studio.region}). Teléfono: ${studio.phoneDisplay}. Correo electrónico: ${EMAIL}.`,
          '[DATOS REGISTRALES, si el titular es una sociedad inscrita en el Registro Mercantil.]',
        ],
      },
      {
        heading: 'Objeto',
        paragraphs: [
          'Este sitio web informa sobre el estudio de tatuajes, sus artistas y la forma de solicitar cita. Las solicitudes se realizan por Instagram o por teléfono; el sitio web no permite contratar servicios ni realizar pagos.',
        ],
      },
      {
        heading: 'Propiedad intelectual',
        paragraphs: [
          'Las fotografías de los trabajos pertenecen a Premium Tattoo y a los artistas que los han realizado. No está permitida su reproducción sin autorización.',
          'El mapa se ha generado con datos de OpenStreetMap (© colaboradores de OpenStreetMap, licencia ODbL).',
        ],
      },
      {
        heading: 'Enlaces externos',
        paragraphs: [
          'El sitio enlaza con Instagram y Google Maps. El titular no se hace responsable del contenido ni de las políticas de privacidad de esos servicios.',
        ],
      },
      {
        heading: 'Legislación aplicable',
        paragraphs: ['Este aviso legal se rige por la legislación española. [JUZGADOS COMPETENTES, si el titular quiere indicarlos.]'],
      },
    ],
  },
  privacidad: {
    title: 'Política de privacidad',
    sections: [
      {
        heading: 'Responsable del tratamiento',
        paragraphs: [`${OWNER}, NIF ${NIF}, ${FISCAL_ADDRESS}. Contacto: ${EMAIL}.`],
      },
      {
        heading: 'Datos que trata este sitio web',
        paragraphs: [
          'Este sitio web no tiene formularios que envíen datos. La herramienta "Prepara tu mensaje" genera el texto en tu propio navegador y no lo envía a ningún servidor.',
          'Si escribes al estudio por Instagram o llamas por teléfono, el estudio tratará los datos que facilites (nombre, contacto, descripción del tatuaje y fechas) para responder a tu solicitud y, en su caso, gestionar la cita.',
        ],
      },
      {
        heading: 'Base legal y conservación',
        paragraphs: [
          'La base legal es la aplicación de medidas precontractuales a petición del interesado (art. 6.1.b RGPD) y, en su caso, tu consentimiento.',
          '[PLAZO DE CONSERVACIÓN de las conversaciones y datos de clientes.]',
        ],
      },
      {
        heading: 'Destinatarios',
        paragraphs: [
          'Las conversaciones por Instagram se gestionan a través de Meta Platforms Ireland Ltd., con su propia política de privacidad. No se ceden datos a terceros salvo obligación legal.',
        ],
      },
      {
        heading: 'Tus derechos',
        paragraphs: [
          `Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a ${EMAIL}. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).`,
        ],
      },
    ],
  },
  cookies: {
    title: 'Política de cookies',
    sections: [
      {
        heading: 'Qué usa este sitio web',
        paragraphs: [
          'Este sitio web no utiliza cookies de análisis, publicidad ni redes sociales.',
          'Solo guarda en tu navegador (almacenamiento local) el idioma que eliges, con la clave "premium-tattoo-lang". Es un dato técnico de personalización solicitado por ti, exento de consentimiento según el artículo 22.2 de la LSSI-CE. Puedes borrarlo desde la configuración de tu navegador.',
        ],
      },
      {
        heading: 'Servicios de terceros',
        paragraphs: [
          'Los enlaces a Instagram y Google Maps te llevan a sitios externos, que aplican sus propias cookies. El mapa de esta página es una imagen estática y no carga contenido de terceros.',
        ],
      },
      {
        heading: 'Cambios',
        paragraphs: [
          'Si en el futuro se añaden herramientas de analítica o contenido de terceros, esta política se actualizará y se pedirá tu consentimiento antes de activarlas.',
        ],
      },
    ],
  },
};

export function isLegalPage(value: string): value is LegalPage {
  return value in docs;
}

export function legalTitle(page: LegalPage): string {
  return docs[page].title;
}

export function renderLegalPage(page: LegalPage): string {
  const doc = docs[page];
  const sections = doc.sections
    .map((section) => `<h2>${e(section.heading)}</h2>${section.paragraphs.map((para) => `<p>${e(para)}</p>`).join('')}`)
    .join('');
  const others = (Object.keys(docs) as LegalPage[])
    .filter((key) => key !== page)
    .map((key) => `<a href="/${key}.html">${e(docs[key].title)}</a>`)
    .join('');
  return `
<header class="legal__header">
  <a class="legal__back" href="/">← ${e(studio.name)}</a>
</header>
<main class="legal" id="main">
  <p class="legal__pending" role="note">PENDIENTE DE REVISIÓN LEGAL. Plantilla: los datos entre corchetes los debe aportar el titular y el texto debe revisarlo un profesional antes de publicar.</p>
  <h1>${e(doc.title)}</h1>
  ${sections}
  <p class="legal__updated">Última actualización: ${e(LAST_UPDATE)}</p>
  <nav class="legal__others" aria-label="Otras páginas legales">${others}</nav>
</main>`;
}
