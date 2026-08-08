/* ==========================================================================
   El Gran Sueño — Base de datos de publicaciones
   --------------------------------------------------------------------------
   Este archivo es TU FUENTE ÚNICA para el listado de Escritos y Huellas.
   Cada vez que publiques uno nuevo:
     1) Duplicá la plantilla (_PLANTILLA-articulo.html o _PLANTILLA-huella.html)
     2) Renombrá el archivo con el slug (ej: sos-lo-que-dios-dijo.html)
     3) Agregá una entrada acá con ese mismo slug
     4) Guardá — el listado se actualiza solo.
   --------------------------------------------------------------------------
   CAMPOS OBLIGATORIOS:
     slug     → nombre del archivo SIN el .html (ej: 'sos-lo-que-dios-dijo')
     titulo   → título del artículo o nombre de la persona
     fecha    → 'YYYY-MM-DD' (se usa para ordenar por más reciente)
     excerpt  → 1 o 2 frases de resumen (o frase-cita, en huellas)
   OPCIONAL:
     destacado → true → aparece siempre primero, con borde dorado
     link      → si el archivo HTML del artículo NO existe todavía y querés
                 que la card apunte a otro (ej: 'blog-articulo.html' como
                 vista previa), poné el link acá. Cuando publiques el
                 archivo real, borrá esta línea y el link se arma solo
                 desde el slug.
   ========================================================================== */

window.EGS_ESCRITOS = [
  {
    slug: "escrito-identidad-dios-ya-dijo",
    titulo: "Tu identidad no comienza en vos. Comienza en Cristo.",
    pregunta: "¿Quién soy realmente en Cristo?",
    pilar: "identidad",
    pilarLabel: "Identidad",
    excerpt: "El evangelio no nos invita a descubrir quiénes queremos ser. Nos invita a vivir desde la nueva vida que ya recibimos en Cristo.",
    lectura: "6 min",
    fecha: "2026-01-20",
    destacado: false
  },
  {
    slug: "escrito-proposito-fidelidad",
    titulo: "El propósito no es un destino escondido. Es participar de la vida que Dios ya comenzó en Cristo.",
    pregunta: "¿Cuál es el propósito de mi vida según Dios?",
    pilar: "proposito",
    pilarLabel: "Propósito",
    excerpt: "Muchas veces buscamos descubrir el gran plan para nuestra vida, mientras Dios nos invita, primero, a caminar con Él. El propósito no nace de encontrar un camino perfecto, sino de permanecer en Aquel que ya es el Camino.",
    lectura: "5 min",
    fecha: "2026-01-14",
    destacado: false
  },
  {
    slug: "escrito-reino-modo-vivir",
    titulo: "El Reino no es solamente una promesa futura. Es la vida de Cristo gobernando el presente.",
    pregunta: "¿Qué es el Reino de Dios?",
    pilar: "reino",
    pilarLabel: "Reino de Dios",
    excerpt: "El Reino de Dios no comienza cuando todo sea restaurado. Comenzó con Cristo, continúa por medio del Espíritu y un día será manifestado en plenitud.",
    lectura: "7 min",
    fecha: "2025-12-22",
    destacado: false
  },
  {
    slug: "escrito-santificacion-comunidad",
    titulo: "La santificación no ocurre lejos de las personas. Cristo nos forma en medio de ellas.",
    pregunta: "¿Qué es la santificación y cómo crecer en ella?",
    pilar: "santificacion",
    pilarLabel: "Santificación",
    excerpt: "Dios no nos salva para aislarnos del mundo, sino para incorporarnos a un cuerpo donde la vida de Cristo comienza a transformar nuestra manera de amar.",
    lectura: "6 min",
    fecha: "2025-12-10",
    destacado: false
  },
  {
    slug: "escrito-caracter-antes-que-plataforma",
    titulo: "Dios se preocupa más por formar a Cristo en vos que por hacer crecer tu plataforma.",
    pregunta: "¿Por qué Dios forma mi carácter antes que mis logros?",
    pilar: "caracter",
    pilarLabel: "Carácter",
    excerpt: "Podemos construir plataformas grandes sobre caracteres pequeños. Pero Dios no busca simplemente personas con buen carácter; busca hijos en quienes la vida de Cristo pueda manifestarse.",
    lectura: "5 min",
    fecha: "2025-12-03",
    destacado: false
  },
  {
    slug: "escrito-dones-para-servicio",
    titulo: "Los dones no son para definir quién sos. Son la expresión de la vida de Cristo sirviendo a otros.",
    pregunta: "¿Para qué sirven los dones espirituales?",
    pilar: "dones",
    pilarLabel: "Dones",
    excerpt: "El Espíritu no reparte dones para construir plataformas personales, sino para que Cristo sea visible a través de su cuerpo.",
    lectura: "6 min",
    fecha: "2025-11-25",
    destacado: false
  },
  {
    slug: "escrito-servicio-invisible",
    titulo: "El verdadero servicio comienza cuando Cristo deja de apuntarnos hacia nosotros mismos.",
    pregunta: "¿Cómo servir a Dios sin buscar reconocimiento?",
    pilar: "servicio",
    pilarLabel: "Servicio",
    excerpt: "Mientras el servicio busque alimentar nuestra identidad, seguirá girando alrededor del yo. Cuando Cristo ocupa el centro, servir vuelve a ser simplemente amar.",
    lectura: "4 min",
    fecha: "2025-11-18",
    destacado: false
  },
  {
    slug: "escrito-comunidad-forma-humana",
    titulo: "La comunidad no es una estrategia de crecimiento. Es la expresión de una nueva humanidad.",
    pregunta: "¿Por qué necesito la comunidad cristiana?",
    pilar: "comunidad",
    pilarLabel: "Comunidad",
    excerpt: "La comunidad cristiana no nace porque personas decidan reunirse. Nace porque Cristo hace posible una vida compartida que antes era imposible.",
    lectura: "7 min",
    fecha: "2025-11-08",
    destacado: false
  },
  {
    slug: "escrito-gran-comision-forma-vivir",
    titulo: "La Gran Comisión no es un proyecto misionero. Es la continuación de la vida de Cristo en el mundo.",
    pregunta: "¿Qué es la Gran Comisión y cómo vivirla hoy?",
    pilar: "comision",
    pilarLabel: "Gran Comisión",
    excerpt: "La misión no comienza con una estrategia. Comienza cuando Cristo encuentra personas disponibles para seguir amando al mundo a través de ellas.",
    lectura: "8 min",
    fecha: "2025-10-28",
    destacado: false
  }
];

window.EGS_HUELLAS = [
  {
    slug: 'huella-george-muller',
    nombre: 'George Müller',
    meta: '1805 — 1898 · Inglaterra · Fe',
    frase: 'Nunca le pediré a un ser humano por dinero para la obra del Señor. Le pediré solo a Dios.',
    fecha: '2026-01-15',
    destacado: false  },
  {
    slug: 'huella-hudson-taylor',
    nombre: 'Hudson Taylor',
    meta: '1832 — 1905 · Inglaterra / China · Misiones',
    frase: 'La obra de Dios, hecha a la manera de Dios, nunca va a carecer de las provisiones de Dios.',
    fecha: '2026-01-05',
    destacado: false  },
  {
    slug: 'huella-corrie-ten-boom',
    nombre: 'Corrie ten Boom',
    meta: '1892 — 1983 · Países Bajos · Perdón',
    frase: 'No hay pozo tan profundo que el amor de Dios no sea aún más profundo.',
    fecha: '2025-12-18',
    destacado: false  },
  {
    slug: 'huella-jim-elliot',
    nombre: 'Jim Elliot',
    meta: '1927 — 1956 · EE.UU. / Ecuador · Entrega',
    frase: 'No es tonto quien da lo que no puede conservar, para ganar lo que no puede perder.',
    fecha: '2025-12-05',
    destacado: false  },
  {
    slug: 'huella-charles-spurgeon',
    nombre: 'Charles Spurgeon',
    meta: '1834 — 1892 · Inglaterra · Dependencia',
    frase: 'La oración no vence la resistencia de Dios; se adhiere a la voluntad de Dios.',
    fecha: '2025-11-22',
    destacado: false  },
  {
    slug: 'huella-madre-teresa',
    nombre: 'Madre Teresa',
    meta: '1910 — 1997 · Albania / India · Servicio',
    frase: 'No podemos hacer grandes cosas. Solo pequeñas cosas — con gran amor.',
    fecha: '2025-11-10',
    destacado: false  },
  {
    slug: 'huella-dietrich-bonhoeffer',
    nombre: 'Dietrich Bonhoeffer',
    meta: '1906 — 1945 · Alemania · Discipulado',
    frase: 'Cuando Cristo llama a un hombre, lo llama a venir y morir.',
    fecha: '2025-10-30',
    destacado: false  },
  {
    slug: 'huella-amy-carmichael',
    nombre: 'Amy Carmichael',
    meta: '1867 — 1951 · Irlanda / India · Amor',
    frase: 'Uno puede dar sin amar. Pero no puede amar sin dar.',
    fecha: '2025-10-15',
    destacado: false  }
];
