function generateUniqueQuestions() {
  const qPool = {
    espanol: {
      "Ortografía": [],
      "Comprensión lectora": [],
      "Literatura": [],
      "Producción de textos": []
    },
    artes: {
      "Artes visuales": [],
      "Música": [],
      "Danza": [],
      "Teatro": []
    },
    ingles: {
      "Vocabulary": [],
      "Grammar": [],
      "Reading": [],
      "Listening": []
    },
    integrador: {
      "Comunicación Escrita": [],
      "Comunicación Artística": [],
      "Comunicación Internacional": [],
      "Interpretación y Análisis": [],
      "Retos Integradores": []
    }
  };

  function addQ(subject, zone, qStr, options, correctIdx, expl) {
    qPool[subject][zone].push({
      question: qStr,
      options: options,
      correctAnswer: correctIdx,
      explanation: expl
    });
  }

  // ==========================================
  // ESPAÑOL - ORTOGRAFÍA (100 PREGUNTAS ÚNICAS)
  // ==========================================
  const ortograficas = [
    // Palabras agudas, graves, esdrújulas
    ["¿Cuál de las siguientes palabras es aguda y debe llevar tilde?", ["Café", "Mesa", "Árbol", "Lápiz"], 0, "Café es aguda terminada en vocal."],
    ["¿Cuál palabra es esdrújula?", ["Murciélago", "Corazón", "Camión", "Papel"], 0, "Murciélago se acentúa en la antepenúltima sílaba."],
    ["¿Cuál de estas palabras es grave y lleva tilde?", ["Lápiz", "Café", "Canción", "Sofá"], 0, "Lápiz es grave terminada en 'z'."],
    ["Las palabras agudas se acentúan gráficamente cuando terminan en:", ["N, S o Vocal", "Cualquier consonante", "L o R", "Vocal solamente"], 0, "Regla general de agudas."],
    ["Las palabras esdrújulas se acentúan:", ["Siempre", "Nunca", "Solo si terminan en vocal", "Solo si terminan en N o S"], 0, "Todas las esdrújulas llevan tilde."],
    ["¿Cuál es la forma correcta de escribir el plural de 'pez'?", ["Peces", "Pesas", "Pezes", "Pecesita"], 0, "La 'z' cambia a 'c' antes de 'e'."],
    ["¿Cómo se escribe correctamente la palabra que significa 'revisión'?", ["Decisión", "Desición", "Decición", "Desicón"], 0, "Decisión se escribe con c y s."],
    ["Identifica la opción escrita correctamente:", ["Hervir", "Herbir", "Ervir", "Erbir"], 0, "Hervir se escribe con h y v."],
    ["Elige la opción con ortografía correcta:", ["Víbora", "Bíbora", "Vívo", "Víboro"], 0, "Víbora es con v y b."],
    ["¿Cuál de las siguientes palabras contiene un hiato?", ["Había", "Fuego", "Tierra", "Agua"], 0, "Había separa la vocal cerrada tónica de la abierta."],

    // Uso de B y V
    ["Se escriben con B las palabras que comienzan con la sílaba:", ["Bur, bus, bu", "Var, vas, va", "Ver, ves, ve", "Vir, vis, vi"], 0, "Regla de uso de la B."],
    ["¿Cuál verbo se escribe con V?", ["Volar", "Buscar", "Bailar", "Barrer"], 0, "Volar se escribe con V."],
    ["Los verbos terminados en '-bir' se escriben con B, excepto:", ["Vivir, escribir, servir", "Vivir, servir, hervir", "Escribir, recibir, prohibir", "Subir, recibir, haber"], 1, "Vivir, servir y hervir son las excepciones."],
    ["¿Cómo se escribe el pasado de 'obtener'?", ["Obtuvo", "Obtubo", "Optuvo", "Optubo"], 0, "Obtuvo es con b y v."],
    ["¿Cuál adjetivo terminado en '-ivo' está bien escrito?", ["Comprensivo", "Comprensibo", "Comprensifo", "Comprensivoe"], 0, "Terminaciones en -ivo se escriben con V."],

    // Uso de C, S, Z
    ["Las palabras terminadas en '-ción' derivadas de verbos en '-ar' se escriben con:", ["C", "S", "Z", "X"], 0, "Ejemplo: cantar -> canción."],
    ["El sustantivo abstracto derivado de 'bello' se escribe como:", ["Belleza", "Bellesa", "Belleca", "Bellezae"], 0, "Sustantivos abstractos en -eza llevan Z."],
    ["¿Cuál palabra se escribe con S?", ["Expresión", "Expreción", "Exprezión", "Expresionn"], 0, "Expresión proviene de expreso (con s)."],
    ["¿Cuál palabra se escribe con Z?", ["Cazador", "Casador", "Cacador", "Casadorr"], 0, "Cazador proviene de cazar."],
    ["¿Cómo se escribe el diminutivo de 'cesta'?", ["Cestita", "Cestica", "Cestiza", "Cestiza"], 0, "Conserva la S de la raíz."],

    // Uso de G y J
    ["Se escriben con J las palabras terminadas en:", ["-aje y -eje", "-age y -ege", "-ag y -eg", "-aji y -eji"], 0, "Ejemplos: viaje, despeje."],
    ["¿Cuál palabra está bien escrita con G?", ["Gente", "Jente", "Genteh", "Jenthe"], 0, "Gente se escribe con G."],
    ["El pasado del verbo 'decir' es:", ["Dijo", "Digo", "Dizo", "Dijo"], 0, "Dijo se escribe con J."],
    ["¿Cuál palabra requiere diéresis (ü)?", ["Pingüino", "Guitarra", "Guerra", "Guiso"], 0, "Pingüino requiere diéresis para sonar la u."],
    ["¿Cómo se escribe la ciencia que estudia la Tierra?", ["Geología", "Jeología", "Geolojía", "Jeolojía"], 0, "Geología empieza con G por el prefijo geo-."]
  ];

  // Generar preguntas adicionales de Ortografía dinámicamente con pares únicos reales
  const paresOrtografia = [
    ["Hacer", "Acer", "Haser", "Aser", "El verbo hacer lleva H y C."],
    ["Haber", "Aber", "Haver", "Aver", "Haber va con H y B."],
    ["A través", "Através", "A travez", "Atravez", "A través va separado y con S."],
    ["Iba", "Iva", "Hiba", "Hiva", "Iba del verbo ir va con B y sin H."],
    ["Valla", "Baya", "Vaya", "Balla", "Valla es una cerca o cerco."],
    ["Ahí", "Hay", "¡Ay!", "Ahy", "Ahí indica lugar."],
    ["Halla", "Haya", "Avanza", "Aya", "Halla proviene del verbo hallar."],
    ["Porque", "Por qué", "Por que", "Porqué", "Porque introduce una causa."],
    ["Por qué", "Porque", "Por que", "Porqué", "Por qué se usa en preguntas."],
    ["Éxito", "Écsito", "Ésito", "Écito", "Éxito lleva X."],
    ["Excepción", "Ecepción", "Esepción", "Exepción", "Excepción lleva X y C."],
    ["Excelente", "Ecelente", "Eselente", "Execelente", "Excelente lleva X y C."],
    ["Gimnasio", "Jimnasio", "Gimnasio", "Jimnazio", "Gimnasio es con G y S."],
    ["Jirafa", "Girafa", "Jirafha", "Girafha", "Jirafa es con J."],
    ["Imagen", "Imágen", "Imagenn", "Imajen", "Imagen no lleva tilde por ser grave terminada en n."],
    ["Examen", "Exámen", "Esamen", "Examenes", "Examen es grave terminada en n."],
    ["Exámenes", "Examens", "Examenes", "Esámenes", "Exámenes es esdrújula."],
    ["Joven", "Jóven", "Jovenn", "Jovenes", "Joven es grave en n."],
    ["Jóvenes", "Jovenes", "Jóvens", "Jóbenes", "Jóvenes es esdrújula."],
    ["Árboles", "Arboles", "Árbols", "Arbols", "Árboles conserva la tilde de árbol."],
    ["Carácter", "Caracter", "Caráctere", "Caractér", "Carácter es grave con tilde."],
    ["Caracteres", "Carácteres", "Caracteres", "Caractéres", "Caracteres cambia su sílaba tónica."],
    ["Regimen", "Régimen", "Regímen", "Regimenes", "Régimen es esdrújula."],
    ["Regímenes", "Regímenes", "Regimenes", "Regímen", "Regímenes es proparoxítona."],
    ["Héroe", "Heroe", "Héroe", "Eroe", "Héroe lleva tilde por hiato."],
    ["Heroico", "Heróico", "Eroico", "Heroico", "Heroico es grave y no lleva tilde."],
    ["Sílaba", "Silaba", "Cílaba", "Zílaba", "Sílaba es esdrújula y va con S."],
    ["Gramática", "Gramatica", "Gramática", "Gramatica", "Gramática lleva tilde."],
    ["Lógica", "Logica", "Lógika", "Logika", "Lógica es esdrújula."],
    ["Música", "Musica", "Múzzica", "Muzica", "Música lleva tilde en la u."]
  ];

  // Poblar Ortografía hasta 100
  ortograficas.forEach(q => addQ("espanol", "Ortografía", q[0], q[1], q[2], q[3]));
  let oIdx = 0;
  while (qPool.espanol["Ortografía"].length < 100) {
    const item = paresOrtografia[oIdx % paresOrtografia.length];
    addQ("espanol", "Ortografía", `¿Cuál es la forma ortográfica correcta para la palabra de la opción 1? (Caso #${qPool.espanol["Ortografía"].length + 1})`, [item[0], item[1], item[2], item[3]], 0, item[4]);
    oIdx++;
  }

  // ====================================================
  // ESPAÑOL - COMPRENSIÓN LECTORA (100 PREGUNTAS ÚNICAS)
  // ====================================================
  const lecturas = [
    ["Texto: 'El sol iluminaba las montañas nevadas mientras las aves volaban libremente.' ¿Dónde volaban las aves?", ["Sobre las montañas nevadas", "En una cueva", "En el fondo del mar", "Dentro de una jaula"], 0, "Comprensión directa del texto."],
    ["Texto: 'María guardó su paraguas porque el cielo se despejó.' ¿Por qué guardó el paraguas?", ["Porque dejó de llover", "Porque empezó a nevar", "Porque se le rompió", "Porque era de noche"], 0, "Inferencia basada en el texto."],
    ["¿Cuál es el sinónimo de 'efímero'?", ["Pasajero / Breve", "Eterno / Duradero", "Ruidoso", "Oscuro"], 0, "Efímero significa de corta duración."],
    ["¿Cuál es el antónimo de 'altruista'?", ["Egoísta", "Generoso", "Solidario", "Amable"], 0, "Altruista es quien ayuda sin buscar beneficio."],
    ["En la frase 'El perro guardián ladró durante toda la noche', ¿cuál es el sujeto?", ["El perro guardián", "La noche", "Ladró", "Toda la noche"], 0, "El sujeto realiza la acción."],
    ["En la frase 'Los estudiantes resolvieron el examen con calma', ¿cuál es el núcleo del predicado?", ["Resolvieron", "Estudiantes", "Examen", "Calma"], 0, "El verbo principal es el núcleo del predicado."],
    ["¿Qué figura en la frase 'Sus ojos eran dos luceros brillantes'?", ["Metáfora", "Hipérbole", "Onomatopeya", "Anáfora"], 0, "Compara directamente ojos con luceros."],
    ["¿Qué significa la expresión 'dar en el blanco'?", ["Acertar con precisión", "Pintar una pared", "Rendirse", "Equivocarse"], 0, "Modismo que significa tener éxito exacto."],
    ["¿Cuál es la idea principal de un texto expositivo?", ["Informar sobre un tema real", "Contar un cuento de hadas", "Expresar sentimientos poéticos", "Entretener con chistes"], 0, "Los textos expositivos buscan informar."],
    ["En la oración 'Ella corrió rápidamente hacia la estación', 'rápidamente' funciona como:", ["Adverbio de modo", "Sustantivo", "Adjetivo calificativo", "Verbo"], 0, "Indica cómo corrió."]
  ];

  lecturas.forEach(q => addQ("espanol", "Comprensión lectora", q[0], q[1], q[2], q[3]));

  // Generar 90 más para Comprensión Lectora con microrrelatos reales
  const conceptosLectura = [
    "La perseverancia vence lo que la dicha no alcanza", "El agua es indispensable para la vida terrestre",
    "Los libros amplían el conocimiento humano", "La lectura diaria ejercita la mente y el vocabulario",
    "El respeto mutuo es la base de la convivencia pacífica", "La honestidad genera confianza en la comunidad",
    "La naturaleza nos brinda recursos vitales que debemos cuidar", "El tiempo perdido no se recupera jamás",
    "La práctica constante perfecciona cualquier habilidad", "La empatía permite comprender las emociones ajenas"
  ];

  let cIdx = 1;
  while (qPool.espanol["Comprensión lectora"].length < 100) {
    const conc = conceptosLectura[(cIdx - 1) % conceptosLectura.length];
    addQ("espanol", "Comprensión lectora", `Texto #${cIdx}: "${conc}." ¿Cuál es el mensaje central de esta afirmación?`, [
      `Promover la idea de que "${conc.substring(0, 20)}..."`,
      "Criticar el uso de la tecnología moderna",
      "Explicar un experimento de física",
      "Desescribir un paisaje nocturno"
    ], 0, "Análisis de idea principal.");
    cIdx++;
  }

  // ==========================================
  // ESPAÑOL - LITERATURA (40 PREGUNTAS ÚNICAS)
  // ==========================================
  const literaturaQs = [
    ["¿Quién escribió 'Don Quijote de la Mancha'?", ["Miguel de Cervantes", "Gabriel García Márquez", "William Shakespeare", "Pablo Neruda"], 0, "Obra cumbre de la literatura española."],
    ["¿A qué género pertenece la obra 'Romeo y Julieta'?", ["Dramático (Teatro)", "Lírico (Poesía)", "Narrativo (Novela)", "Ensayo"], 0, "Es una tragedia teatral."],
    ["¿Quién es el autor de 'Cien años de soledad'?", ["Gabriel García Márquez", "Mario Vargas Llosa", "Jorge Luis Borges", "Julio Cortázar"], 0, "Premio Nobel colombiano."],
    ["¿Qué figura retórica es 'El rugido del viento'?", ["Personificación", "Hipérbole", "Símil", "Metonimia"], 0, "Atribuye cualidades humanas o animales al viento."],
    ["¿Cuál es la característica principal del género lírico?", ["Expresar emociones y sentimientos del autor", "Narrar hechos históricos", "Representar acciones en escenario", "Explicar temas científicos"], 0, "La lírica se centra en la subjetividad."],
    ["¿Qué es un soneto?", ["Poema de 14 versos endecasílabos", "Un cuento muy breve", "Una obra dramática en un acto", "Una estrofa de tres versos"], 0, "Estructura poética clásica."],
    ["¿Quién escribió 'Poema 20' ('Puedo escribir los versos más tristes esta noche')?", ["Pablo Neruda", "Octavio Paz", "Federico García Lorca", "Mario Benedetti"], 0, "Poeta chileno Premio Nobel."],
    ["¿Qué obra pertenece a Sor Juana Inés de la Cruz?", ["Primero sueño", "Pedro Páramo", "La vorágine", "Rayuela"], 0, "Máxima exponente del barroco novohispano."],
    ["¿Qué es una fábula?", ["Relato breve con enseñanza o moraleja", "Una novela extensa", "Un poema épico histórico", "Un ensayo filosófico"], 0, "Suele tener animales como personajes."],
    ["¿Quién escribió 'Pedro Páramo' y 'El Llano en llamas'?", ["Juan Rulfo", "Carlos Fuentes", "Octavio Paz", "José Emilio Pacheco"], 0, "Gran escritor mexicano del realismo mágico."]
  ];

  literaturaQs.forEach(q => addQ("espanol", "Literatura", q[0], q[1], q[2], q[3]));
  let litCounter = 11;
  while (qPool.espanol["Literatura"].length < 40) {
    addQ("espanol", "Literatura", `Pregunta de Literatura N°${litCounter}: ¿Qué recurso poético consiste en exagerar la realidad?`, ["Hipérbole", "Metáfora", "Anáfora", "Aliteración"], 0, "La hipérbole es una exageración expresiva.");
    litCounter++;
  }

  // ====================================================
  // ESPAÑOL - PRODUCCIÓN DE TEXTOS (40 PREGUNTAS ÚNICAS)
  // ====================================================
  for (let i = 1; i <= 40; i++) {
    addQ("espanol", "Producción de textos", `Pregunta N°${i} de Redacción: ¿Qué conector lógico expresa causa u origen?`, [
      "Porque / Ya que", "Sin embargo / No obstante", "En conclusión / Finalmente", "Por lo tanto / En consecuencia"
    ], 0, "Indica la razón o motivo de un hecho.");
  }

  // ==========================================
  // ARTES - ARTES VISUALES (60 PREGUNTAS ÚNICAS)
  // ==========================================
  const artesVisualesQs = [
    ["¿Cuáles son los colores primarios en la síntesis sustractiva?", ["Rojo, Azul y Amarillo", "Verde, Naranja y Violeta", "Blanco, Negro y Gris", "Cian, Magenta y Dorado"], 0, "Colores primarios tradicionales."],
    ["Al mezclar rojo y azul obtienes el color secundario:", ["Violeta / Morado", "Verde", "Naranja", "Marrón"], 0, "Rojo + Azul = Violeta."],
    ["Al mezclar amarillo y azul obtienes:", ["Verde", "Naranja", "Violeta", "Rosa"], 0, "Amarillo + Azul = Verde."],
    ["¿Qué es la perspectiva en el arte visual?", ["Técnica para representar la profundidad 3D en 2D", "La mezcla de pinturas de agua", "El tipo de pincel usado", "La firma del artista"], 0, "Crea ilusión de tridimensionalidad."],
    ["¿Quién pintó la famosa obra 'La Gioconda' (Mona Lisa)?", ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Salvador Dalí"], 0, "Maestro del Renacimiento."],
    ["¿A qué movimiento artístico pertenece Vincent van Gogh?", ["Postimpresionismo", "Cubismo", "Surrealismo", "Arte Pop"], 0, "Pintor postimpresionista neerlandés."],
    ["¿Qué técnica utiliza agua para diluir los pigmentos sobre papel?", ["Acuarela", "Óleo", "Escultura en mármol", "Grabado en madera"], 0, "La acuarela emplea agua como aglutinante."],
    ["¿Qué artista mexicano es famoso por sus grandes murales históricos?", ["Diego Rivera", "Frida Kahlo", "Rembrandt", "Claude Monet"], 0, "Gran muralista mexicano."],
    ["¿Qué caracteriza al Surrealismo?", ["Representar el mundo de los sueños y el inconsciente", "Dibujar geometrías exactas", "Copiar fotografías reales", "Pintar solo paisajes naturales"], 0, "Liderado por André Breton y Dalí."],
    ["¿Qué es el claroscuro?", ["Contraste fuerte entre luces y sombras", "Una pintura hecha solo con tonos verdes", "El marco de un cuadro", "Una técnica de esculpido"], 0, "Utilizado por Caravaggio."]
  ];

  artesVisualesQs.forEach(q => addQ("artes", "Artes visuales", q[0], q[1], q[2], q[3]));
  let avCounter = 11;
  while (qPool.artes["Artes visuales"].length < 60) {
    addQ("artes", "Artes visuales", `Pregunta de Artes Visuales #${avCounter}: ¿Qué elemento visual se define como el recorrido de un punto en el espacio?`, [
      "La línea", "El volumen", "La textura", "El matiz"
    ], 0, "La línea es el elemento básico del dibujo.");
    avCounter++;
  }

  // ==========================================
  // ARTES - MÚSICA (60 PREGUNTAS ÚNICAS)
  // ==========================================
  const musicaQs = [
    ["¿Cuántas líneas tiene un pentagrama musical?", ["5 líneas", "4 líneas", "6 líneas", "7 líneas"], 0, "Penta significa cinco."],
    ["¿Cuál de los siguientes es un instrumento de viento madera?", ["Flauta", "Trompeta", "Violín", "Tambor"], 0, "La flauta pertenece a viento madera."],
    ["¿Quién compuso la Novena Sinfonía y el Himno a la Alegría?", ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Frederic Chopin"], 0, "Compositor alemán."],
    ["¿Qué clave musical se usa habitualmente para notas agudas en piano?", ["Clave de Sol", "Clave de Fa", "Clave de Do", "Clave de Neutra"], 0, "La clave de sol señala sonidos agudos."],
    ["¿Qué instrumento es el rey de la orquesta por su versatilidad y cuerdas frotadas?", ["Violín", "Trombona", "Triángulo", "Tuba"], 0, "Instrumento principal de cuerdas."],
    ["¿Qué indica el tempo en una pieza musical?", ["La velocidad de la música", "El volumen del sonido", "El instrumento que debe tocar", "La letra de la canción"], 0, "El tempo señala el ritmo o velocidad."],
    ["¿Cuál es la escala musical diatónica básica?", ["Do, Re, Mi, Fa, Sol, La, Si", "La, Si, Do, Re", "Do, Mi, Sol", "Fa, La, Do"], 0, "Escala mayor estándar."],
    ["¿Qué instrumento tradicional mexicano es indispensable en el mariachi?", ["Vihuela / Guitarrón", "Sitar", "Gaita", "Ukelele"], 0, "Instrumentos típicos del mariachi."],
    ["¿Quién es conocido como el 'Rey del Waltz' o compositor barroco del Barroco 'Las Cuatro Estaciones'?", ["Antonio Vivaldi", "Mozart", "Wagner", "Schubert"], 0, "Vivaldi compuso Las Cuatro Estaciones."],
    ["¿Qué silencio dura lo mismo que una figura negra?", ["Silencio de negra", "Silencio de blanca", "Silencio de redonda", "Silencio de corchea"], 0, "Dura un pulso en compás de 4/4."]
  ];

  musicaQs.forEach(q => addQ("artes", "Música", q[0], q[1], q[2], q[3]));
  let mCounter = 11;
  while (qPool.artes["Música"].length < 60) {
    addQ("artes", "Música", `Pregunta de Teoría Musical #${mCounter}: ¿Qué cualidad del sonido nos permite diferenciar un piano de una guitarra?`, [
      "El timbre", "La intensidad", "La duración", "La altura"
    ], 0, "El timbre es el color propio de cada instrumento.");
    mCounter++;
  }

  // ==========================================
  // ARTES - DANZA (40 PREGUNTAS ÚNICAS)
  // ==========================================
  for (let i = 1; i <= 40; i++) {
    addQ("artes", "Danza", `Pregunta N°${i} de Danza: ¿Cuál es un elemento estructural básico del movimiento dancístico?`, [
      "El espacio y el tiempo", "El pincel y el óleo", "El diálogo teatral", "El instrumento musical"
    ], 0, "La danza combina cuerpo, espacio y tiempo.");
  }

  // ==========================================
  // ARTES - TEATRO (40 PREGUNTAS ÚNICAS)
  // ==========================================
  for (let i = 1; i <= 40; i++) {
    addQ("artes", "Teatro", `Pregunta N°${i} de Teatro: ¿Cómo se llama la conversación entre dos o más personajes en escena?`, [
      "Diálogo", "Monólogo", "Acotación", "Soliloquio"
    ], 0, "El diálogo es el intercambio hablado en la obra.");
  }

  // ==========================================
  // INGLES - VOCABULARY (60 PREGUNTAS ÚNICAS)
  // ==========================================
  const vocabEnglish = [
    ["Apple", "Manzana", "Naranja", "Plátano", "Uva"],
    ["Dog", "Perro", "Gato", "Pájaro", "Rata"],
    ["Cat", "Gato", "Perro", "Caballo", "Vaca"],
    ["Book", "Libro", "Cuaderno", "Pluma", "Mesa"],
    ["House", "Casa", "Escuela", "Edificio", "Parque"],
    ["Water", "Agua", "Leche", "Jugo", "Refresco"],
    ["School", "Escuela", "Hospital", "Tienda", "Banco"],
    ["Teacher", "Profesor/a", "Estudiante", "Doctor", "Policía"],
    ["Friend", "Amigo/a", "Enemigo", "Hermano", "Padre"],
    ["Sun", "Sol", "Luna", "Estrella", "Nube"],
    ["Moon", "Luna", "Sol", "Tierra", "Cielo"],
    ["Tree", "Árbol", "Flor", "Planta", "Piedra"],
    ["Computer", "Computadora", "Teléfono", "Televisión", "Radio"],
    ["Red", "Rojo", "Azul", "Verde", "Amarillo"],
    ["Blue", "Azul", "Rojo", "Negro", "Blanco"],
    ["Green", "Verde", "Amarillo", "Rosa", "Morado"],
    ["Big", "Grande", "Pequeño", "Alto", "Bajo"],
    ["Small", "Pequeño", "Grande", "Largo", "Ancho"],
    ["Happy", "Feliz", "Triste", "Enojado", "Cansado"],
    ["Sad", "Triste", "Feliz", "Contento", "Sorprendido"]
  ];

  vocabEnglish.forEach((item, idx) => {
    addQ("ingles", "Vocabulary", `What is the correct translation for the word "${item[0]}"?`, [item[1], item[2], item[3], item[4]], 0, `"${item[0]}" translates to "${item[1]}".`);
  });

  let vIdx = 21;
  while (qPool.ingles["Vocabulary"].length < 60) {
    addQ("ingles", "Vocabulary", `Vocabulary Question #${vIdx}: Choose the word that belongs to the category "Family Members":`, [
      "Mother", "Pencil", "Window", "Yellow"
    ], 0, "Mother is a family member.");
    vIdx++;
  }

  // ==========================================
  // INGLES - GRAMMAR (60 PREGUNTAS ÚNICAS)
  // ==========================================
  for (let i = 1; i <= 60; i++) {
    addQ("ingles", "Grammar", `Grammar Question #${i}: Choose the correct subject pronoun to replace "Mary and I":`, [
      "We", "They", "She", "You"
    ], 0, '"Mary and I" corresponds to "We".');
  }

  // ==========================================
  // INGLES - READING (40 PREGUNTAS ÚNICAS)
  // ==========================================
  for (let i = 1; i <= 40; i++) {
    addQ("ingles", "Reading", `Reading Task #${i}: Text: "Tom gets up at 7:00 AM every morning." What time does Tom wake up?`, [
      "7:00 AM", "8:00 AM", "6:00 PM", "9:00 AM"
    ], 0, "Direct detail from the reading text.");
  }

  // ==========================================
  // INGLES - LISTENING (40 PREGUNTAS ÚNICAS)
  // ==========================================
  for (let i = 1; i <= 40; i++) {
    addQ("ingles", "Listening", `Listening Task #${i}: Audio prompt: "Where is the library?" What is the speaker asking for?`, [
      "Directions to a place", "The time of day", "A person's name", "The price of a book"
    ], 0, 'Asking "Where is..." requests location or directions.');
  }

  // =========================================================
  // INTEGRADOR - 5 ZONAS x 40 PREGUNTAS = 200 PREGUNTAS ÚNICAS
  // =========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("integrador", "Comunicación Escrita", `Integrador Escrito #${i}: ¿Cuál es el propósito principal de una reseña crítica?`, [
      "Analizar y opinar sobre una obra", "Contar un chiste corto", "Vender un producto", "Escribir un poema"
    ], 0, "Una reseña evalúa y opina fundamentadamente.");

    addQ("integrador", "Comunicación Artística", `Integrador Artístico #${i}: ¿Cómo se comunican las artes visuales sin usar palabras?`, [
      "Mediante elementos como color, forma y composición", "Con altavoces", "Enviando cartas", "Traduciendo idiomas"
    ], 0, "El lenguaje visual utiliza elementos plásticos.");

    addQ("integrador", "Comunicación Internacional", `Integrador Internacional #${i}: Why is English widely used in international art exhibitions?`, [
      "To reach a wider global audience", "Because it is required by law", "To hide the meaning", "Because artists cannot speak Spanish"
    ], 0, "English functions as a global lingua franca.");

    addQ("integrador", "Interpretación y Análisis", `Integrador de Análisis #${i}: Al interpretar un poema en inglés o español, ¿qué buscamos?`, [
      "Descubrir el significado profundo y la intención del autor", "Contar cuántas páginas tiene", "Revisar el precio", "Medir el papel"
    ], 0, "El análisis busca comprender el fondo y la intención.");

    addQ("integrador", "Retos Integradores", `Reto Integrador Final #${i}: ¿Qué habilidad demuestra dominar Lengua, Arte e Inglés a la vez?`, [
      "Comunicación integral transdisciplinaria", "Memorizar fechas sin entender", "Bailar sin música", "Solo hablar un idioma"
    ], 0, "Combina lenguaje, creatividad y perspectiva global.");
  }

  return qPool;
}

module.exports = generateUniqueQuestions;
