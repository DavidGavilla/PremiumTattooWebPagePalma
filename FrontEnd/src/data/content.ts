// All business content lives here. Every fact is traced in ../../FUENTES.md.
// Edit this file to update texts, works, artists or contact details.

export type Lang = 'es' | 'en';
export type Localized = Readonly<Record<Lang, string>>;
export type ArtistId = 'santino' | 'steven' | 'marcos';

export interface Artist {
  readonly id: ArtistId;
  readonly name: string;
  readonly handle: string;
  readonly instagram: string;
  readonly role: Localized;
  readonly styles: Localized;
  readonly bio: Localized;
  /** Card photo: a piece not shown in the gallery, so nothing repeats. */
  readonly image: string;
  readonly imageAlt: Localized;
}

export interface Work {
  readonly image: string;
  /** null when the studio posted it without crediting a specific artist. */
  readonly artist: ArtistId | null;
  readonly title: Localized;
  readonly alt: Localized;
  readonly source: string;
}

export interface OpeningHours {
  readonly days: Localized;
  readonly schemaDays: readonly string[];
  readonly opens: string;
  readonly closes: string;
}

export interface Review {
  readonly author: string;
  readonly when: Localized;
  /** Star rating shown on Google (1-5). */
  readonly rating: number;
  /** Language the review was written in; `text` is verbatim in that language. */
  readonly original: Lang;
  readonly text: string;
  /** Our translation into the other language, labelled as such on the page. */
  readonly translation: string;
  /** Only approved reviews are published. Candidates wait for the studio's OK. */
  readonly approved: boolean;
}

export interface Faq {
  readonly q: Localized;
  readonly a: Localized;
}

export const studio = {
  name: 'Premium Tattoo',
  instagramHandle: '@premium__tattoo',
  instagramUrl: 'https://www.instagram.com/premium__tattoo/',
  instagramDmUrl: 'https://ig.me/m/premium__tattoo',
  // Number published in the studio's Instagram bio (Oct 2026). Google Maps lists a
  // different one (626 17 86 78): pending confirmation, see FUENTES.md.
  phoneDisplay: '683 192 892',
  phoneHref: 'tel:+34683192892',
  street: 'Plaça de Sant Antoni, 1',
  postalCode: '07002',
  locality: 'Palma',
  region: 'Illes Balears',
  country: 'ES',
  latitude: 39.5720917,
  longitude: 2.6556645,
  mapsUrl: 'https://maps.google.com/?cid=15082121806064852358',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=39.5720917,2.6556645',
  googleRating: { value: '4,9', valueEn: '4.9', count: 43, checkedOn: '2026-10-05' },
} as const;

export const openingHours: readonly OpeningHours[] = [
  { days: { es: 'Lunes', en: 'Monday' }, schemaDays: ['Monday'], opens: '12:00', closes: '21:00' },
  { days: { es: 'Martes a sábado', en: 'Tuesday to Saturday' }, schemaDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '11:00', closes: '21:00' },
  { days: { es: 'Domingo', en: 'Sunday' }, schemaDays: ['Sunday'], opens: '12:00', closes: '21:00' },
];

export const artists: readonly Artist[] = [
  {
    id: 'santino',
    name: 'Santino Bartoli',
    handle: '@santinobartoli',
    instagram: 'https://www.instagram.com/santinobartoli/',
    role: { es: 'Fundador del estudio', en: 'Studio owner' },
    styles: { es: 'Black & grey, realismo, retrato, lettering y neotradicional', en: 'Black & grey, realism, portraits, lettering and neo-traditional' },
    bio: {
      es: 'Dirige Premium Tattoo y suma 24 años tatuando, según su perfil. En septiembre de 2026 fue artista invitado en Blue Coast Tattoo, en Colonia.',
      en: 'He runs Premium Tattoo and, according to his profile, has been tattooing for 24 years. In September 2026 he was a guest artist at Blue Coast Tattoo in Cologne.',
    },
    image: 'santino-bartoli-realismo-rostro',
    imageAlt: { es: 'Rostro femenino realista en black & grey con elementos geométricos en el antebrazo', en: 'Black and grey realistic female face with geometric elements on the forearm' },
  },
  {
    id: 'steven',
    name: 'Steven Enriquez',
    handle: '@mvp_tattoo',
    instagram: 'https://www.instagram.com/mvp_tattoo/',
    role: { es: 'Artista del estudio', en: 'Studio artist' },
    styles: { es: 'Black & grey, realismo, mangas y cover-ups', en: 'Black & grey, realism, sleeves and cover-ups' },
    bio: {
      es: 'Trabaja mangas completas y cover-ups en black & grey. También recibe solicitudes por mensaje privado en su cuenta.',
      en: 'He works on full sleeves and cover-ups in black & grey. He also takes requests by direct message on his own account.',
    },
    image: 'steven-enriquez-manga-leon',
    imageAlt: { es: 'Brazo tatuado en black & grey con un león, un ojo realista rojo y lettering', en: 'Black and grey arm tattoo with a lion, a realistic red eye and lettering' },
  },
  {
    id: 'marcos',
    name: 'Marcos Nash',
    handle: '@marcos_nash13',
    instagram: 'https://www.instagram.com/marcos_nash13/',
    role: { es: 'Artista del estudio', en: 'Studio artist' },
    styles: { es: 'Black & grey, color y lettering', en: 'Black & grey, colour and lettering' },
    bio: {
      es: 'Representó el black & grey de Premium Tattoo en la primera Mallorca Tattoo Convention, en el Palma Arena.',
      en: 'He represented Premium Tattoo’s black & grey work at the first Mallorca Tattoo Convention, held at Palma Arena.',
    },
    image: 'marcos-nash-anubis-mano',
    imageAlt: { es: 'Tatuaje black & grey de Anubis sujetando una cruz ankh en el dorso de la mano', en: 'Black and grey tattoo of Anubis holding an ankh on the back of the hand' },
  },
];

export const works: readonly Work[] = [
  {
    image: 'steven-enriquez-aguila-realismo',
    artist: 'steven',
    title: { es: 'Águila realista en el hombro', en: 'Realistic eagle on the shoulder' },
    alt: { es: 'Tatuaje black & grey de una cabeza de águila con plumas detalladas en el hombro', en: 'Black and grey tattoo of an eagle head with detailed feathers on the shoulder' },
    source: 'https://www.instagram.com/p/DdjiGtwqp4_/',
  },
  {
    image: 'santino-bartoli-retrato-realista',
    artist: 'santino',
    title: { es: 'Retrato realista', en: 'Realistic portrait' },
    alt: { es: 'Retrato realista en black & grey de un hombre sonriente con gafas', en: 'Black and grey realistic portrait of a smiling man wearing glasses' },
    source: 'https://www.instagram.com/p/DaDuTCbjONL/',
  },
  {
    image: 'steven-enriquez-manga-ojo',
    artist: 'steven',
    title: { es: 'Manga exterior con ojo y Carpe Diem', en: 'Outer sleeve with eye and Carpe Diem' },
    alt: { es: 'Manga black & grey con un ojo realista, nubes, reloj y la palabra Carpe Diem en rojo', en: 'Black and grey sleeve with a realistic eye, clouds, a clock and the words Carpe Diem in red' },
    source: 'https://www.instagram.com/p/Dcvv1SwioU0/',
  },
  {
    image: 'santino-bartoli-neotradicional-daga-cover-up',
    artist: 'santino',
    title: { es: 'Daga neotradicional (cover-up)', en: 'Neo-traditional dagger (cover-up)' },
    alt: { es: 'Tatuaje neotradicional a color de una daga con golondrina en el antebrazo', en: 'Colour neo-traditional tattoo of a dagger with a swallow on the forearm' },
    source: 'https://www.instagram.com/p/DYSLz-DsbSr/',
  },
  {
    image: 'marcos-nash-gengar-color',
    artist: 'marcos',
    title: { es: 'Gengar a color en el brazo', en: 'Colour Gengar on the arm' },
    alt: { es: 'Tatuaje a color del Pokémon Gengar con tonos morados y rosas en el brazo', en: 'Colour tattoo of the Pokémon Gengar in purple and pink tones on the arm' },
    source: 'https://www.instagram.com/p/DbF2xzusope/',
  },
  {
    image: 'steven-enriquez-cover-up-tigre',
    artist: 'steven',
    title: { es: 'Cover-up con tigre', en: 'Tiger cover-up' },
    alt: { es: 'Cover-up black & grey de un tigre rugiendo con ojos rojos', en: 'Black and grey cover-up of a roaring tiger with red eyes' },
    source: 'https://www.instagram.com/p/Da-axTbKC8d/',
  },
  {
    image: 'estudio-hannya-black-grey',
    artist: null,
    title: { es: 'Hannya y figura femenina', en: 'Hannya mask and female figure' },
    alt: { es: 'Tatuaje black & grey de una mujer con máscara hannya de ojos rojos y flores', en: 'Black and grey tattoo of a woman with a red-eyed hannya mask and flowers' },
    source: 'https://www.instagram.com/p/DT0GRcpDNhU/',
  },
  {
    image: 'santino-bartoli-lettering-mano',
    artist: 'santino',
    title: { es: 'Lettering en la mano', en: 'Hand lettering' },
    alt: { es: 'Lettering caligráfico en black & grey sobre el dorso de la mano', en: 'Black and grey calligraphic lettering on the back of the hand' },
    source: 'https://www.instagram.com/p/DeFOmDFjMvl/',
  },
  {
    image: 'steven-enriquez-manga-reloj',
    artist: 'steven',
    title: { es: 'Inicio de manga con reloj', en: 'Sleeve in progress with clock' },
    alt: { es: 'Antebrazo con un reloj de bolsillo realista y una huella en black & grey', en: 'Forearm with a realistic pocket watch and a footprint in black and grey' },
    source: 'https://www.instagram.com/p/DbJIzrMKFQl/',
  },
  {
    image: 'steven-enriquez-religioso-lettering',
    artist: 'steven',
    title: { es: 'Pieza religiosa con lettering', en: 'Religious piece with lettering' },
    alt: { es: 'Tatuaje en el costado con Cristo, una Virgen y lettering gótico en black & grey', en: 'Side tattoo with Christ, the Virgin and gothic lettering in black and grey' },
    source: 'https://www.instagram.com/p/DbdN3NYChUD/',
  },
  {
    image: 'marcos-nash-proceso-lettering-labio',
    artist: 'marcos',
    title: { es: 'Lettering XOXO en el labio', en: 'XOXO lettering inside the lip' },
    alt: { es: 'Manos con guantes colocando la plantilla XOXO en el interior del labio inferior', en: 'Gloved hands placing an XOXO stencil inside the lower lip' },
    source: 'https://www.instagram.com/p/DbQoob_s2mD/',
  },
];

// Verbatim from Google Maps (checked 2026-10-05, all 5 stars). Candidates with
// approved: false are listed in FUENTES.md for validation and are not rendered.
export const reviews: readonly Review[] = [
  {
    author: 'Lucía G.',
    when: { es: 'Google, hace 7 meses', en: 'Google, 7 months ago' },
    rating: 5,
    original: 'es',
    text: 'Un gusto tatuarse en este estudio, un trato super profesional y agradable. Steven una paciencia y un muy buen tatuador.',
    translation: 'A pleasure to get tattooed at this studio, really professional and friendly. Steven has such patience and is a very good tattoo artist.',
    approved: true,
  },
  {
    author: 'Elisa F.',
    when: { es: 'Google, hace 3 meses', en: 'Google, 3 months ago' },
    rating: 5,
    original: 'es',
    text: 'Personal amable, trato profesional y cercano a la vez.',
    translation: 'Kind staff, professional and approachable at the same time.',
    approved: true,
  },
  {
    author: 'Mia F.',
    when: { es: 'Google, hace 7 meses', en: 'Google, 7 months ago' },
    rating: 5,
    original: 'es',
    text: 'Para mí el mejor lugar para tatuarse con los mejores profesionales !! Me e tatuado todo un brazo y me está quedando espectacular !!! Lo recomiendo 100 %',
    translation: 'For me the best place to get tattooed, with the best professionals! I have had a whole arm done and it is looking spectacular! I recommend it 100%.',
    approved: false,
  },
  {
    author: 'Aina M.',
    when: { es: 'Google, hace 3 meses', en: 'Google, 3 months ago' },
    rating: 5,
    original: 'es',
    text: 'Súper agradables, higiénicos y rápidos! Vine dos veces de la confianza que nos transmitieron. Todos los trabajadores son súper majos y responsables. 10/10!',
    translation: 'Really friendly, hygienic and quick! I came twice because of the trust they gave us. All the staff are really nice and responsible. 10/10!',
    approved: false,
  },
  {
    author: 'Liam C.',
    when: { es: 'Google, hace 4 meses', en: 'Google, 4 months ago' },
    rating: 5,
    original: 'en',
    text: 'Very good, recommend to anyone visiting Palma was clear from the outset on pricing and took his time with the design and finish.',
    translation: 'Muy bien, lo recomiendo a cualquiera que visite Palma. Fue claro desde el principio con el precio y se tomó su tiempo con el diseño y el acabado.',
    approved: false,
  },
  {
    author: 'Alexandra O.',
    when: { es: 'Google, hace 7 meses', en: 'Google, 7 months ago' },
    rating: 5,
    original: 'es',
    text: 'Son súper simpáticos y profesionales,no tardan nada y hacen las cosas genial',
    translation: 'They are really friendly and professional, they are quick and do things brilliantly.',
    approved: false,
  },
];

export const faqs: readonly Faq[] = [
  {
    q: { es: '¿Cómo pido cita?', en: 'How do I ask for an appointment?' },
    a: {
      es: 'Escribe al estudio por Instagram (@premium__tattoo) con tu idea, la zona, el tamaño aproximado y tus fechas, o llama al 683 192 892. Enviar la solicitud no reserva la cita: queda confirmada cuando el estudio te lo confirma.',
      en: 'Message the studio on Instagram (@premium__tattoo) with your idea, placement, approximate size and dates, or call 683 192 892. Sending a request does not book the session: it is confirmed once the studio confirms it.',
    },
  },
  {
    q: { es: '¿Qué horario tenéis?', en: 'What are your opening hours?' },
    a: {
      es: 'Lunes y domingo de 12:00 a 21:00. De martes a sábado de 11:00 a 21:00.',
      en: 'Monday and Sunday from 12:00 to 21:00. Tuesday to Saturday from 11:00 to 21:00.',
    },
  },
  {
    q: { es: '¿Qué estilos trabajáis?', en: 'Which styles do you work in?' },
    a: {
      es: 'Sobre todo black & grey: realismo, retratos, mangas y lettering. En los trabajos publicados también hay piezas a color, neotradicional y cover-ups.',
      en: 'Mainly black & grey: realism, portraits, sleeves and lettering. The published work also includes colour pieces, neo-traditional and cover-ups.',
    },
  },
  {
    q: { es: '¿Puedo elegir artista?', en: 'Can I choose an artist?' },
    a: {
      es: 'Sí. Indica en tu mensaje con quién quieres tatuarte. Steven Enriquez también atiende solicitudes por privado en @mvp_tattoo.',
      en: 'Yes. Say who you would like to work with in your message. Steven Enriquez also takes requests by direct message at @mvp_tattoo.',
    },
  },
  {
    q: { es: '¿Cuánto cuesta un tatuaje?', en: 'How much does a tattoo cost?' },
    a: {
      es: 'El estudio no publica tarifas. Pregunta el precio al enviar tu idea.',
      en: 'The studio does not publish prices. Ask for a quote when you send your idea.',
    },
  },
  {
    q: { es: '¿Dónde estáis?', en: 'Where are you?' },
    a: {
      es: 'En la Plaça de Sant Antoni, 1, 07002 Palma, en el centro de la ciudad.',
      en: 'At Plaça de Sant Antoni, 1, 07002 Palma, in the city centre.',
    },
  },
];
