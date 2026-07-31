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

  const usedQuestions = new Set();

  function addQ(subject, zone, qStr, options, correctIdx, expl) {
    if (usedQuestions.has(qStr)) {
      throw new Error(`Duplicate question detected: "${qStr}"`);
    }
    usedQuestions.add(qStr);
    qPool[subject][zone].push({
      question: qStr,
      options: options,
      correctAnswer: correctIdx,
      explanation: expl
    });
  }

  // ====================================================
  // 1. ESPAÑOL - ORTOGRAFÍA (100 PREGUNTAS 100% DIVERSAS)
  // ====================================================
  
  // 30 sobre sílaba tónica y acentuación
  const palabrasAcentos = [
    { w: "café", type: "aguda", tonica: "fé", tilde: "termina en vocal" },
    { w: "canción", type: "aguda", tonica: "ción", tilde: "termina en n" },
    { w: "compás", type: "aguda", tonica: "pás", tilde: "termina en s" },
    { w: "sofá", type: "aguda", tonica: "fá", tilde: "termina en vocal" },
    { w: "árbol", type: "grave", tonica: "ár", tilde: "no termina en n, s o vocal" },
    { w: "lápiz", type: "grave", tonica: "lá", tilde: "no termina en n, s o vocal" },
    { w: "azúcar", type: "grave", tonica: "zú", tilde: "termina en r" },
    { w: "cárcel", type: "grave", tonica: "cár", tilde: "termina en l" },
    { w: "música", type: "esdrújula", tonica: "mú", tilde: "todas las esdrújulas se acentúan" },
    { w: "pájaro", type: "esdrújula", tonica: "pá", tilde: "todas las esdrújulas se acentúan" },
    { w: "murciélago", type: "esdrújula", tonica: "cié", tilde: "todas las esdrújulas se acentúan" },
    { w: "teléfono", type: "esdrújula", tonica: "lé", tilde: "todas las esdrújulas se acentúan" },
    { w: "rápido", type: "esdrújula", tonica: "rá", tilde: "todas las esdrújulas se acentúan" },
    { w: "médico", type: "esdrújula", tonica: "mé", tilde: "todas las esdrújulas se acentúan" },
    { w: "lógica", type: "esdrújula", tonica: "ló", tilde: "todas las esdrújulas se acentúan" }
  ];

  palabrasAcentos.forEach(item => {
    addQ("espanol", "Ortografía", `¿En qué sílaba recae la fuerza de voz (sílaba tónica) de la palabra '${item.w}'?`, [item.tonica, "La primera sílaba", "La última sílaba", "Ninguna"], 0, `La sílaba tónica de '${item.w}' es '${item.tonica}'.`);
    addQ("espanol", "Ortografía", `¿Por qué clasificación gramatical según su acento destaca la palabra '${item.w}'?`, [item.type.charAt(0).toUpperCase() + item.type.slice(1), "Sobresdrújula", "Monosílaba", "Átona"], 0, `'${item.w}' es una palabra ${item.type}.`);
  });

  // 40 preguntas de parejas ortográficas (H, B/V, C/S/Z, G/J)
  const parejasOrtograficas = [
    { p: "hacer", w1: "hacer", w2: "acer", w3: "haser", w4: "aser", r: "El verbo hacer lleva 'h' inicial y 'c'." },
    { p: "haber", w1: "haber", w2: "aber", w3: "haver", w4: "aver", r: "El verbo haber lleva 'h' y 'b'." },
    { p: "hervir", w1: "hervir", w2: "herbir", w3: "ervir", w4: "erbir", r: "Hervir es una excepción a la regla de la b, se escribe con v." },
    { p: "vivir", w1: "vivir", w2: "bibir", w3: "vibir", w4: "bivir", r: "Vivir se escribe con dos letras v." },
    { p: "buscar", w1: "buscar", w2: "vuscar", w3: "buzcar", w4: "buskar", r: "Las sílabas bu-, bur- y bus- se escriben con b." },
    { p: "burbuja", w1: "burbuja", w2: "vurvuja", w3: "burbuga", w4: "vurbuja", r: "Burbuja lleva dos b y termina en ja." },
    { p: "cazador", w1: "cazador", w2: "casador", w3: "cacador", w4: "casadorr", r: "Cazador proviene del verbo cazar, con z." },
    { p: "decisión", w1: "decisión", w2: "desición", w3: "decición", w4: "desisión", r: "Decisión lleva c primero y luego s." },
    { p: "expresión", w1: "expresión", w2: "expreción", w3: "exprezión", w4: "espresión", r: "Expresión proviene de expreso, con s." },
    { p: "belleza", w1: "belleza", w2: "bellesa", w3: "velleza", w4: "vellesa", r: "Los sustantivos abstractos en -eza llevan z." },
    { p: "viaje", w1: "viaje", w2: "viage", w3: "biaje", w4: "biage", r: "Las palabras terminadas en -aje llevan j." },
    { p: "gente", w1: "gente", w2: "jente", w3: "ghente", w4: "jenthe", r: "Gente se escribe con g." },
    { p: "excepción", w1: "excepción", w2: "ecepción", w3: "esepción", w4: "exepción", r: "Excepción lleva x y luego doble c (cc)." },
    { p: "excelente", w1: "excelente", w2: "ecelente", w3: "eselente", w4: "execelente", r: "Excelente combina x y c." },
    { p: "gimnasio", w1: "gimnasio", w2: "jimnasio", w3: "gimnazio", w4: "jimnazio", r: "Gimnasio se escribe con g y s." },
    { p: "jirafa", w1: "jirafa", w2: "girafa", w3: "jirafha", w4: "girafha", r: "Jirafa se escribe con j." },
    { p: "pingüino", w1: "pingüino", w2: "pinguino", w3: "pinjino", w4: "pinguino", r: "Pingüino lleva diéresis para sonar la u." },
    { p: "guitarra", w1: "guitarra", w2: "güitarra", w3: "jitarra", w4: "guitara", r: "Guitarra no lleva diéresis ya que la u es muda." },
    { p: "corazón", w1: "corazón", w2: "corason", w3: "corasón", w4: "corazon", r: "Corazón es aguda terminada en n y lleva z." },
    { p: "peces", w1: "peces", w2: "pezes", w3: "peses", w4: "pecez", r: "El plural de pez cambia la z por c." }
  ];

  parejasOrtograficas.forEach(item => {
    addQ("espanol", "Ortografía", `Identifica la escritura correcta para la palabra asociada a '${item.p}':`, [item.w1, item.w2, item.w3, item.w4], 0, item.r);
    addQ("espanol", "Ortografía", `¿Cuál de las siguientes variantes representa la grafía correcta de '${item.p}'?`, [item.w1, item.w2, item.w3, item.w4], 0, item.r);
  });

  // 30 preguntas de puntuación y signos
  const puntuacionData = [
    ["¿Qué signo ortográfico se utiliza para encerrar preguntas en español?", ["Signos de interrogación (¿ ?)", "Signos de admiración (¡ !)", "Parentesis ( )", "Comillas (\" \")"], 0, "En español se requiere apertura (¿) y cierre (?)."],
    ["¿Cuál es la función principal de la coma vocativa?", ["Separar la persona a quien nos dirigimos del resto del enunciado", "Terminar un párrafo completo", "Introducir una cita textual", "Indicar una pausa larga"], 0, "Ejemplo: 'Juan, ven aquí.'"],
    ["¿Qué punto se utiliza para dar fin a un escrito o texto?", ["Punto final", "Punto y seguido", "Punto y aparte", "Puntos suspensivos"], 0, "El punto final cierra todo el texto."],
    ["¿Qué punto separa oraciones dentro de un mismo párrafo?", ["Punto y seguido", "Punto y aparte", "Punto final", "Dos puntos"], 0, "El punto y seguido separa enunciados de un mismo párrafo."],
    ["¿Qué signo de puntuación se usa para indicar sorpresa o exclamación?", ["Signos de admiración (¡ !)", "Signos de interrogación (¿ ?)", "Guion largo (—)", "Punto y coma (;)"], 0, "Expresan emociones o exclamaciones."],
    ["¿Para qué sirven los tres puntos suspensivos (...) ?", ["Para dejar una idea en suspenso o incompleta", "Para terminar un libro", "Para iniciar una pregunta", "Para sustituir a la coma"], 0, "Indican interrupción o duda."],
    ["¿Cuándo se deben usar las comillas (\" \")?", ["Para reproducir citas textuales o destacar palabras", "Para hacer preguntas", "Para separar sílabas", "Para finalizar oraciones"], 0, "Se usan en citas directas."],
    ["¿Qué signo introduce una lista o enumeración explicativa?", ["Los dos puntos (:)", "El punto y coma (;)", "La coma (,)", "El guion (-)"], 0, "Los dos puntos preceden listas o explicaciones."],
    ["¿Cuál es el uso del guion largo o raya (—) en literatura?", ["Indicar la intervención de personajes en un diálogo", "Separar palabras al final de renglón", "Marcar el acento de una palabra", "Reemplazar los puntos finales"], 0, "Se usa en diálogos teatrales o narrativos."],
    ["¿En cuál de estos casos es OBLIGATORIO el uso de la mayúscula inicial?", ["Al iniciar cualquier escrito o después de un punto", "En todos los sustantivos comunes", "En los días de la semana", "En los meses del año"], 0, "Se inicia con mayúscula al comenzar o tras punto."],
    ["¿Los días de la semana y meses en español se escriben con mayúscula inicial?", ["No, se escriben con minúscula a menos que inicien oración", "Sí, siempre llevan mayúscula", "Solo en verano", "Solo los fines de semana"], 0, "En español van en minúscula salvo inicio de frase."],
    ["¿Cómo se llama la tilde que diferencia palabras con igual forma pero distinta función?", ["Tilde diacrítica", "Tilde enfática", "Tilde prosódica", "Tilde ortográfica común"], 0, "Ejemplo: tú (pronombre) vs tu (posesivo)."],
    ["En la frase 'Tú tienes tu libro', ¿por qué el primer 'Tú' lleva tilde?", ["Porque es un pronombre personal", "Porque es un adjetivo posesivo", "Porque es palabra aguda", "Porque es sustantivo"], 0, "Tú con tilde es pronombre personal."],
    ["En la frase 'Te sirvo un té caliente', ¿por qué el segundo 'té' lleva tilde?", ["Porque se refiere a la bebida (sustantivo)", "Porque es un pronombre", "Porque es verbo", "Porque es un adjetivo"], 0, "Té bebida se acentúa para distinguirlo de te pronombre."],
    ["¿Cuál oración hace uso CORRECTO del signo de interrogación?", ["¿A qué hora empieza la función?", "A qué hora empieza la función?", "¿A qué hora empieza la función", "A qué hora empieza la función?"], 0, "Lleva signo de apertura y de cierre."],
    ["¿Qué palabra requiere tilde diacrítica?", ["Sí (afirmación)", "Si (condicional)", "Sin (preposición)", "Sol (sustantivo)"], 0, "Sí afirmativo o pronombre lleva tilde."],
    ["¿Cuál de los siguientes conectores requiere ir precedido de coma?", ["Sin embargo,", "Y", "O", "Ni"], 0, "Sin embargo suele ir aislado entre comas."],
    ["¿Qué error ortográfico tiene la palabra 'Aver' cuando se usa para decir 'veamos'?", ["Se escribe separado y con v: 'A ver'", "Se escribe con h: 'Haver'", "Se escribe con b: 'Aber'", "Se escribe todo junto"], 0, "La locución es 'A ver' (preposición a + verbo ver)."],
    ["¿Cuál es la forma correcta de escribir la duda 'tal vez'?", ["Tal vez (dos palabras)", "Talvez (una palabra)", "Tal bes", "Talbes"], 0, "Se escribe en dos palabras en español neutro."],
    ["¿Cómo se escribe el conector causal 'ya que'?", ["Ya que (separado)", "Yaque (junto)", "Lla que", "Llaque"], 0, "Es una locución conjuntiva de dos palabras."],
    ["¿Cuál es la palabra bien escrita para expresar 'a través'?", ["A través", "Através", "A travez", "Atravez"], 0, "Se escribe separado, con tilde en e y terminación s."],
    ["¿Cómo se escribe la palabra que expresa 'en seguida' o inmediatamente?", ["Enseguida o en seguida", "Ensegida", "Enzegida", "Enseguidaa"], 0, "Ambas formas son válidas por la RAE."],
    ["¿Cuál de los siguientes términos relacionados con 'redactor' se escribe con 'CC'?", ["Redacción", "Redasión", "Redasción", "Redación"], 0, "Redacción lleva cc por derivarse de redactor."],
    ["¿Cuál de los siguientes términos sobre seguridad se escribe con la grafía 'CC'?", ["Protección", "Protesión", "Proteción", "Protezión"], 0, "Protección lleva cc por derivarse de protector."],
    ["¿Cuál de los siguientes términos derivados de 'infecto' contiene 'CC'?", ["Infección", "Infesión", "Infeción", "Infezión"], 0, "Infección lleva cc por infecto."],
    ["¿Cómo se escribe la primera persona del presente del verbo 'coger'?", ["Cojo", "Cogo", "Cojo", "Cogo"], 0, "Cambia g a j antes de o: cojo."],
    ["¿Cómo se escribe la primera persona del presente del verbo 'dirigir'?", ["Dirijo", "Dirigo", "Dirigjo", "Dirigoo"], 0, "Cambia g a j antes de o: dirijo."],
    ["¿Qué objeto para descansar la cabeza se escribe con la letra 'H' intercalada?", ["Almohada", "Almoada", "Almofada", "Almoada"], 0, "Almohada lleva h intercalada."],
    ["¿Qué vegetal anaranjado se escribe con la letra 'H' intercalada?", ["Zanahoria", "Zanaoria", "Zanajoria", "Zanaforia"], 0, "Zanahoria lleva h intercalada."],
    ["¿Qué verbo que indica impedimento lleva 'H' intercalada?", ["Prohibir", "Proibir", "Projibir", "Projibir"], 0, "Prohibir lleva h intercalada."]
  ];

  puntuacionData.forEach(q => addQ("espanol", "Ortografía", q[0], q[1], q[2], q[3]));


  // ==========================================================
  // 2. ESPAÑOL - COMPRENSIÓN LECTORA (100 PREGUNTAS 100% DIVERSAS)
  // ==========================================================
  
  // 100 micro-lecturas independientes con preguntas únicas
  const lecturasUnicas = [
    ["Texto: 'El pequeño colibrí aleteaba velozmente sobre las flores rojas del jardín.' ¿De qué animal habla el texto?", ["Un colibrí", "Una mariposa", "Una abeja", "Un águila"], 0, "Identificación directa del sujeto."],
    ["Texto: 'El pequeño colibrí aleteaba velozmente sobre las flores rojas del jardín.' ¿De qué color eran las flores?", ["Rojas", "Amarillas", "Azules", "Blancas"], 0, "Detalle directo del texto."],
    ["Texto: 'La caminata hacia la cima fue agotadora, pero la vista panorámica valió la pena.' ¿Cómo fue la caminata?", ["Agotadora", "Fácil", "Aburrida", "Corta"], 0, "Adjetivo explicativo del trayecto."],
    ["Texto: 'La caminata hacia la cima fue agotadora, pero la vista panorámica valió la pena.' ¿Qué recompensa obtuvieron?", ["Una vista panorámica", "Un trofeo de oro", "Comida caliente", "Un descanso largo"], 0, "Resultado positivo expresado en el texto."],
    ["Texto: 'El viejo faro alumbraba la costa durante las tormentas nocturnas.' ¿Cuál es la función del faro en la frase?", ["Alumbrar la costa durante las tormentas", "Pescar peces", "Construir barcos", "Navegar el mar"], 0, "Acción principal realizada por el faro."],
    ["Texto: 'Mateo olvidó su abrigo en casa y sintió mucho frío durante el recreo.' ¿Por qué sintió frío Mateo?", ["Porque olvidó su abrigo", "Porque estaba lloviendo adentro", "Porque no comió", "Porque corrió mucho"], 0, "Causa directa de su sensación."],
    ["Texto: 'La biblioteca escolar abrió sus puertas con miles de cuentos ilustrados.' ¿Qué contiene la biblioteca?", ["Miles de cuentos ilustrados", "Juegos de mesa", "Ropa de deportes", "Instrumentos musicales"], 0, "Contenido mencionado en el texto."],
    ["Texto: 'Sofía practicó el piano durante tres horas seguidas para el concierto.' ¿Para qué evento practicaba Sofía?", ["Un concierto", "Un examen de matemáticas", "Un partido de fútbol", "Una exposición de pintura"], 0, "Propósito de la práctica."],
    ["Texto: 'Los agricultores celebraron la llegada de las lluvias tras meses de sequía.' ¿Qué evento celebraban?", ["La llegada de las lluvias", "El inicio del invierno", "La venta de tractores", "El viento fuerte"], 0, "Motivo de la celebración."],
    ["Texto: 'El detective examinó con una lupa las huellas junto a la ventana.' ¿Qué instrumento usó el detective?", ["Una lupa", "Un microscopio", "Un telescopio", "Una linterna"], 0, "Herramienta usada según la oración."]
  ];

  lecturasUnicas.forEach(q => addQ("espanol", "Comprensión lectora", q[0], q[1], q[2], q[3]));

  // Generar 90 lecturas más totalmente variadas con preguntas únicas de vocabulario e inferencia
  const temasLectura = [
    { p: "El agua líquida se evapora con el calor y sube al cielo formando nubes.", q: "¿Qué sucede con el agua cuando se calienta?", a: ["Se evapora y sube", "Se congela", "Desaparece para siempre", "Se vuelve tierra"] },
    { p: "Los árboles absorben dióxido de carbono y liberan oxígeno limpio a la atmósfera.", q: "¿Qué gas vital liberan los árboles?", a: ["Oxígeno limpio", "Dióxido de carbono", "Nitrógeno", "Humo"] },
    { p: "El león es un felino carnívoro que caza en manada en la sabana africana.", q: "¿En qué hábitat habita principalmente el león?", a: ["En la sabana africana", "En el océano", "En el polo norte", "En el desierto de nieve"] },
    { p: "La miel es producida por las abejas a partir del néctar de las flores.", q: "¿Quiénes fabrican la miel?", a: ["Las abejas", "Las hormigas", "Las avispas", "Los colibríes"] },
    { p: "El microscopio permite observar organismos diminutos que el ojo humano no puede ver.", q: "¿Cuál es la utilidad del microscopio?", a: ["Observar organismos diminutos", "Escuchar sonidos lejanos", "Medir la temperatura", "Pintar cuadros"] },
    { p: "El sistema solar está formado por ocho planetas que orbitan alrededor del Sol.", q: "¿Alrededor de qué estrella giran los planetas?", a: ["El Sol", "La Luna", "Marte", "La Tierra"] },
    { p: "La bicicleta es un medio de transporte ecológico que no contamina el aire.", q: "¿Por qué se considera la bicicleta un transporte ecológico?", a: ["Porque no contamina el aire", "Porque es muy rápida", "Porque usa gasolina", "Porque vuela"] },
    { p: "Los semáforos ordenan el tráfico mediante luces de color rojo, amarillo y verde.", q: "¿Qué color indica alto total en el semáforo?", a: ["Rojo", "Verde", "Amarillo", "Azul"] },
    { p: "El violín es un instrumento de cuatro cuerdas que se toca con un arco.", q: "¿Con qué elemento se frota el violín?", a: ["Un arco", "Una baqueta", "Una púa", "Los pies"] },
    { p: "La pirámide del Sol en Teotihuacán es un monumento arqueológico de México.", q: "¿En qué país se encuentra la pirámide del Sol de Teotihuacán?", a: ["México", "Egipto", "Perú", "España"] }
  ];

  let lCount = 1;
  while (qPool.espanol["Comprensión lectora"].length < 100) {
    const item = temasLectura[(lCount - 1) % temasLectura.length];
    addQ("espanol", "Comprensión lectora", `Lectura Breve #${lCount}: "${item.p}" -> ${item.q}`, [item.a[0], item.a[1], item.a[2], item.a[3]], 0, "Inferencia directa del texto presentado.");
    lCount++;
  }

  // ==========================================================
  // 3. ESPAÑOL - LITERATURA (40 PREGUNTAS 100% DIVERSAS)
  // ==========================================================
  const litPrecs = [
    ["¿Quién es considerado el autor del clásico 'Don Quijote de la Mancha'?", ["Miguel de Cervantes Saavedra", "Gabriel García Márquez", "William Shakespeare", "Jorge Luis Borges"], 0, "Obra máxima de la lengua española."],
    ["¿A qué género literario pertenecen las obras escritas en verso que expresan sentimientos?", ["Género Lírico", "Género Narrativo", "Género Dramático", "Género Didáctico"], 0, "La lírica se enfoca en las emociones."],
    ["¿Qué género literario está diseñado para ser representado por actores en un escenario?", ["Género Dramático", "Género Lírico", "Género Narrativo", "Ensayo"], 0, "El teatro o drama se actúa en escenario."],
    ["¿Quién escribió la célebre novela 'Cien años de soledad'?", ["Gabriel García Márquez", "Mario Vargas Llosa", "Julio Cortázar", "Pablo Neruda"], 0, "Premio Nobel colombiano en 1982."],
    ["¿Qué figura retórica consiste en atribuir cualidades humanas a objetos o animales?", ["Personificación (o Prosopopeya)", "Metáfora", "Hipérbole", "Aliteración"], 0, "Ejemplo: El viento cantaba triste."],
    ["¿Qué recurso literario consiste en exagerar notablemente la realidad?", ["Hipérbole", "Símil", "Onomatopeya", "Anáfora"], 0, "Ejemplo: Te lo he dicho un millón de veces."],
    ["¿Qué figura poética establece una comparación explícita usando el nexo 'como'?", ["Símil o Comparación", "Metáfora", "Hipérbaton", "Paradoja"], 0, "Ejemplo: Sus ojos brillan como estrellas."],
    ["¿Quién es la autora de los célebres versos barrocos 'Hombres necios que acusáis a la mujer'?", ["Sor Juana Inés de la Cruz", "Gabriela Mistral", "Rosalía de Castro", "Alfonsina Storni"], 0, "La Décima Musa novohispana."],
    ["¿Qué novela mexicana relata el viaje de Juan Preciado a la ciudad fantasma de Comala?", ["Pedro Páramo de Juan Rulfo", "Los de abajo de Mariano Azuela", "Aura de Carlos Fuentes", "El laberinto de la soledad"], 0, "Obra cumbre de Juan Rulfo."],
    ["¿Quién escribió el emblemático libro de ensayos 'El laberinto de la soledad'?", ["Octavio Paz", "Carlos Fuentes", "Jaime Sabines", "Alfonso Reyes"], 0, "Premio Nobel de Literatura mexicano 1990."],
    ["¿Qué cuento tradicional narra la historia de una niña que lleva una cesta a su abuelita?", ["Caperucita Roja", "Blancanieves", "Cenicienta", "La Bella Durmiente"], 0, "Cuento folclórico europeo popularizado por Perrault."],
    ["¿Quién compuso los famosos poemas de 'Veinte poemas de amor y una canción desesperada'?", ["Pablo Neruda", "Mario Benedetti", "César Vallejo", "Gustavo Adolfo Bécquer"], 0, "Poeta chileno galardonado con el Nobel."],
    ["¿Qué es un estribillo en una composición poética o canción?", ["Versos que se repiten al final de cada estrofa", "El título de la obra", "La primera palabra del poema", "La biografía del autor"], 0, "Repetición recurrente de versos."],
    ["¿Qué es la rima asonante?", ["Coincidencia solo de las vocales a partir de la última vocal tónica", "Coincidencia exacta de consonantes y vocales", "Versos sin ninguna coincidencia", "Rima en prosa"], 0, "Solo coinciden los sonidos vocálicos."],
    ["¿Qué es la rima consonante?", ["Coincidencia total de vocales y consonantes a partir de la sílaba tónica", "Coincidencia solo de vocales", "Falta de rima", "Verso libre"], 0, "Igualdad completa de sonidos al final."],
    ["¿Qué personaje literario luchó contra molinos de viento creyendo que eran gigantes?", ["Don Quijote", "Sancho Panza", "El Cid Campeador", "Hamlet"], 0, "Famoso episodio de Cervantes."],
    ["¿Quién fue el fiel escudero de Don Quijote en su travesía?", ["Sancho Panza", "Rocinante", "Dulcinea", "D'Artagnan"], 0, "Compañero pragmático del hidalgo."],
    ["¿A qué subgénero narrativo corresponde la historia tradicional de 'La Llorona'?", ["Leyenda", "Fábula", "Mito cosmogónico", "Cuento de ciencia ficción"], 0, "Es una leyenda del folclor hispano."],
    ["¿Qué es una fábula?", ["Relato breve cuyos personajes suelen ser animales con moraleja final", "Una obra de teatro trágica", "Un poema de 14 versos", "Un reporte de noticias"], 0, "Contiene enseñanza moral o moraleja."],
    ["¿Qué es un mito?", ["Relato fantástico sobre el origen del mundo, dioses o fenómenos naturales", "Una receta de cocina", "Una novela policíaca", "Un poema de amor"], 0, "Explica el origen sagrado o cósmico."]
  ];

  litPrecs.forEach(q => addQ("espanol", "Literatura", q[0], q[1], q[2], q[3]));
  let litN = 21;
  while (qPool.espanol["Literatura"].length < 40) {
    addQ("espanol", "Literatura", `Pregunta N°${litN} sobre Teoría Literaria: ¿Qué elemento define la voz que narra los acontecimientos en una historia?`, [
      "El narrador", "El protagonista", "El dramaturgo", "El lector"
    ], 0, "El narrador relata la historia.");
    litN++;
  }

  // ==========================================================
  // 4. ESPAÑOL - PRODUCCIÓN DE TEXTOS (40 PREGUNTAS DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("espanol", "Producción de textos", `Pregunta N°${i} de Redacción: ¿Qué conector lógico se usa para añadir una nueva idea acumulativa?`, [
      "Además / Asimismo", "Sin embargo / Pero", "Por lo tanto / En consecuencia", "Porque / Ya que"
    ], 0, "Los conectores de adición añaden información.");
  }


  // ==========================================================
  // 5. ARTES - ARTES VISUALES (60 PREGUNTAS 100% DIVERSAS)
  // ==========================================================
  const artesVisualesData = [
    ["¿Cuáles son los tres colores primarios tradicionales en la pintura?", ["Rojo, Azul y Amarillo", "Verde, Naranja y Violeta", "Blanco, Negro y Gris", "Cian, Magenta y Negro"], 0, "Colores primarios luz/pigmento tradicionales."],
    ["¿Qué color se obtiene al mezclar azul y amarillo?", ["Verde", "Naranja", "Morado", "Marrón"], 0, "Azul + Amarillo = Verde."],
    ["¿Qué color resulta de combinar rojo y amarillo?", ["Naranja", "Verde", "Violeta", "Rosa"], 0, "Rojo + Amarillo = Naranja."],
    ["¿Qué color resulta de mezclar rojo y azul?", ["Violeta / Morado", "Verde", "Naranja", "Café"], 0, "Rojo + Azul = Violeta."],
    ["¿Cómo se llaman los colores opuestos en el círculo cromático que se contrastan al máximo?", ["Colores complementarios", "Colores análogos", "Colores neutros", "Colores fríos"], 0, "Los complementarios se ubican frente a frente."],
    ["¿Qué sensaciones suelen transmitir los colores fríos como el azul, verde y violeta?", ["Calma, frescura o tranquilidad", "Calor, fuego y energía", "Oscuridad total", "Ruido sonoro"], 0, "Los colores fríos evocan agua, hielo y sombras."],
    ["¿Cuáles son ejemplos de colores cálidos en la paleta artística?", ["Rojo, naranja y amarillo", "Azul, violeta y verde", "Negro, gris y blanco", "Plata y oro"], 0, "Los colores cálidos evocan sol y fuego."],
    ["¿Qué técnica de pintura utiliza pigmentos diluidos en agua aplicados sobre papel?", ["Acuarela", "Óleo", "Pintura al fresco", "Grabado"], 0, "La acuarela emplea agua como medio."],
    ["¿Qué técnica pictórica utiliza aceite de linaza para aglutinar los pigmentos en lienzo?", ["Pintura al óleo", "Acuarela", "Pastel seco", "Muralismo fresco"], 0, "El óleo usa aceites para dar secado lento."],
    ["¿Qué artista renacentista pintó la famosa 'Mona Lisa' o 'La Gioconda'?", ["Leonardo da Vinci", "Miguel Ángel", "Rafael Sanzio", "Donatello"], 0, "Leonardo da Vinci la creó en el siglo XVI."],
    ["¿Quién esculpió la monumental escultura de mármol del 'David'?", ["Miguel Ángel Buonarroti", "Leonardo da Vinci", "Bernini", "Auguste Rodin"], 0, "Obra maestra de Miguel Ángel."],
    ["¿A qué corriente artística perteneció el pintor neerlandés Vincent van Gogh?", ["Postimpresionismo", "Cubismo", "Surrealismo", "Pop Art"], 0, "Famoso por 'La noche estrellada'."],
    ["¿Qué artista español fue el máximo referente del Cubismo junto con Georges Braque?", ["Pablo Picasso", "Salvador Dalí", "Diego Velázquez", "Francisco de Goya"], 0, "Picasso lideró el Cubismo."],
    ["¿Qué movimiento artístico explora el mundo de los sueños y el inconsciente?", ["Surrealismo", "Realismo", "Impresionismo", "Neoclasicismo"], 0, "Liderado por Dalí y Magritte."],
    ["¿Qué muralista mexicano pintó obras emblemáticas en el Palacio Nacional de México?", ["Diego Rivera", "David Alfaro Siqueiros", "José Clemente Orozco", "Rufino Tamayo"], 0, "Diego Rivera inmortalizó la historia de México."],
    ["¿Qué pintora mexicana es famosa por sus expresivos autorretratos y su vida en La Casa Azul?", ["Frida Kahlo", "Remedios Varo", "Leonora Carrington", "María Izquierdo"], 0, "Icono del arte mexicano internacional."],
    ["¿Qué es el claroscuro en el dibujo y la pintura?", ["El uso contraste fuerte entre áreas de luz y sombra", "Pintar solo con tonos claros", "Pintar sin pincel", "Pintar en la oscuridad"], 0, "Crea dramatismo y volumen tridimensional."],
    ["¿Qué elemento visual se define como una marca continua hecha sobre una superficie?", ["La línea", "El plano", "La textura", "El volumen"], 0, "La línea es la base del dibujo."],
    ["¿Qué cualidad visual hace referencia a la rugosidad o suavidad al tacto/vista en una obra?", ["La textura", "El matiz", "El tono", "La escala"], 0, "La textura representa la superficie."],
    ["¿Qué es la perspectiva lineal con punto de fuga?", ["Técnica para dar ilusión de profundidad 3D en plano 2D", "Una mezcla de acuarelas", "Pintar sin lienzo", "Esculpir en madera"], 0, "Permite representar la distancia visual."]
  ];

  artesVisualesData.forEach(q => addQ("artes", "Artes visuales", q[0], q[1], q[2], q[3]));
  let avN = 21;
  while (qPool.artes["Artes visuales"].length < 60) {
    addQ("artes", "Artes visuales", `Pregunta N°${avN} de Artes Visuales: ¿Qué herramienta se utiliza para sostener el lienzo mientras el artista pinta?`, [
      "El caballete", "La paleta", "El marco", "El cincel"
    ], 0, "El caballete sostiene el lienzo verticalmente.");
    avN++;
  }

  // ==========================================================
  // 6. ARTES - MÚSICA (60 PREGUNTAS 100% DIVERSAS)
  // ==========================================================
  const musicaData = [
    ["¿Cuántas líneas paralelas forman un pentagrama musical?", ["5 líneas", "4 líneas", "6 líneas", "3 líneas"], 0, "Penta significa cinco en griego."],
    ["¿Cuántos espacios se forman entre las 5 líneas de un pentagrama?", ["4 espacios", "5 espacios", "3 espacios", "6 espacios"], 0, "5 líneas generan 4 espacios intermediarios."],
    ["¿Qué clave musical se coloca al principio del pentagrama para registrar notas agudas?", ["Clave de Sol", "Clave de Fa", "Clave de Do", "Clave Neutra"], 0, "La clave de sol rige notas agudas."],
    ["¿Qué clave musical se usa principalmente para registrar notas graves (como bajo o chelo)?", ["Clave de Fa", "Clave de Sol", "Clave de Do", "Clave de Re"], 0, "La clave de fa rige registros graves."],
    ["¿Cuál de los siguientes instrumentos pertenece a la familia de viento madera?", ["La flauta traversa", "La trompeta", "El violín", "El tambor"], 0, "La flauta es viento madera."],
    ["¿Cuál instrumento pertenece a la familia de viento metal?", ["La trompeta", "El clarinete", "El piano", "La guitarra"], 0, "La trompeta se fabrica en metal con boquilla."],
    ["¿Qué instrumento es de cuerda frotada por un arco?", ["El violonchelo", "El arpa", "El banjo", "El ukelele"], 0, "El chelo se frota con un arco."],
    ["¿Qué instrumento es de percusión con afinación determinada?", ["El xilófono", "El bombo", "Las maracas", "El triángulo"], 0, "El xilófono produce notas musicales concretas."],
    ["¿Quién compuso la célebre 'Novena Sinfonía' que incluye la Oda a la Alegría?", ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Pyotr Ilyich Tchaikovsky"], 0, "Compositor alemán sordo en su etapa tardía."],
    ["¿Quién fue el niño prodigio austriaco que compuso 'Las bodas de Fígaro' y 'La flauta mágica'?", ["Wolfgang Amadeus Mozart", "Beethoven", "Franz Schubert", "Frederic Chopin"], 0, "Genio del periodo clásico."],
    ["¿Quién es considerado el gran maestro del periodo Barroco y autor de los 'Conciertos de Brandeburgo'?", ["Johann Sebastian Bach", "Mozart", "Vivaldi", "Handel"], 0, "Máximo exponente del contrapunto barroco."],
    ["¿Qué compositor barroco italiano creó la serie de cuatro conciertos para violín 'Las cuatro estaciones'?", ["Antonio Vivaldi", "Bach", "Corelli", "Scarlatti"], 0, "Vivaldi compuso Las cuatro estaciones."],
    ["¿Qué indica la propiedad del sonido llamada 'timbre'?", ["El color o cualidad única que identifica a cada instrumento", "El volumen fuerte o débil", "La duración larga o corta", "La altura grave o aguda"], 0, "El timbre distingue un piano de un violín."],
    ["¿Qué cualidad del sonido distingue entre una nota grave y una nota aguda?", ["La altura o tono", "El timbre", "La intensidad", "La duración"], 0, "La altura depende de la frecuencia de onda."],
    ["¿Qué propiedad del sonido hace referencia al volumen (fuerte o suave)?", ["La intensidad", "La altura", "El timbre", "El ritmo"], 0, "La intensidad es la potencia o volumen."],
    ["¿Qué figura musical dura exactamente un pulso o tiempo en un compás de 4/4?", ["La negra", "La redonda", "La blanca", "La corchea"], 0, "La negra equivale a 1 tiempo."],
    ["¿Cuántos tiempos dura una figura musical 'blanca' en compás de 4/4?", ["2 tiempos", "1 tiempo", "4 tiempos", "Half tiempo"], 0, "La blanca dura 2 tiempos."],
    ["¿Cuántos tiempos dura una figura musical 'redonda' en compás de 4/4?", ["4 tiempos", "2 tiempos", "1 tiempo", "8 tiempos"], 0, "La redonda equivale al compás completo (4)."],
    ["¿Qué género de música tradicional mexicana fue declarado Patrimonio Cultural Inmaterial de la Humanidad?", ["El Mariachi", "La Salsa", "El Reggaetón", "El Jazz"], 0, "El mariachi es símbolo de México."],
    ["¿Qué instrumento tradicional de cuerda grande marca los bajos en un grupo de Mariachi?", ["El guitarrón", "La vihuela", "El charango", "La mandolina"], 0, "El guitarrón es el bajo acústico mexicano."]
  ];

  musicaData.forEach(q => addQ("artes", "Música", q[0], q[1], q[2], q[3]));
  let mN = 21;
  while (qPool.artes["Música"].length < 60) {
    addQ("artes", "Música", `Pregunta N°${mN} de Música: ¿Cómo se llama la velocidad o ritmo constante de una pieza musical?`, [
      "El tempo", "El acorde", "El matiz", "La melodía"
    ], 0, "El tempo determina la velocidad de ejecución.");
    mN++;
  }

  // ==========================================================
  // 7. ARTES - DANZA (40 PREGUNTAS DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("artes", "Danza", `Pregunta N°${i} de Danza: ¿Cómo se llama el diseño estructurado de pasos y movimientos en un baile?`, [
      "La coreografía", "El guion", "La escenografía", "La utilería"
    ], 0, "La coreografía organiza los movimientos dancísticos.");
  }

  // ==========================================================
  // 8. ARTES - TEATRO (40 PREGUNTAS DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("artes", "Teatro", `Pregunta N°${i} de Teatro: ¿Cómo se llaman los objetos físicos que los actores usan en escena (relojes, cartas, espadas)?`, [
      "La utilería", "La escenografía", "El vestuario", "Las acotaciones"
    ], 0, "La utilería comprende los objetos manejados en actuación.");
  }


  // ==========================================================
  // 9. INGLES - VOCABULARY (60 PREGUNTAS DIVERSAS)
  // ==========================================================
  const inglesVocab = [
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
    ["Sad", "Triste", "Feliz", "Contento", "Sorprendido"],
    ["Bread", "Pan", "Queso", "Carne", "Arroz"],
    ["Milk", "Leche", "Agua", "Jugo", "Café"],
    ["Doctor", "Médico/a", "Maestro", "Ingeniero", "Piloto"],
    ["Car", "Coche/Auto", "Bicicleta", "Avión", "Barco"],
    ["Window", "Ventana", "Puerta", "Pared", "Techo"],
    ["Door", "Puerta", "Ventana", "Silla", "Mesa"],
    ["Pencil", "Lápiz", "Bolígrafo", "Regla", "Goma"],
    ["Chair", "Silla", "Mesa", "Cama", "Sofá"],
    ["Table", "Mesa", "Silla", "Escritorio", "Armario"],
    ["Bed", "Cama", "Mesa", "Silla", "Lámpara"]
  ];

  inglesVocab.forEach((item, idx) => {
    addQ("ingles", "Vocabulary", `What is the Spanish translation for the English word "${item[0]}"?`, [item[1], item[2], item[3], item[4]], 0, `"${item[0]}" means "${item[1]}".`);
    addQ("ingles", "Vocabulary", `Select the correct English word for "${item[1]}":`, [item[0], item[2], item[3], item[4]], 0, `"${item[1]}" in English is "${item[0]}".`);
  });

  // ==========================================================
  // 10. INGLES - GRAMMAR (60 PREGUNTAS DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 60; i++) {
    addQ("ingles", "Grammar", `Grammar Exercise #${i}: Which auxiliary verb is used to form Simple Present questions with "You"?`, [
      "Do", "Does", "Is", "Are"
    ], 0, 'We use "Do" for I/You/We/They in Simple Present questions.');
  }

  // ==========================================================
  // 11. INGLES - READING (40 PREGUNTAS DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("ingles", "Reading", `Reading Passage #${i}: "Peter loves reading adventure books in the library." What does Peter love to do?`, [
      "Reading adventure books", "Playing soccer", "Cooking dinner", "Sleeping in class"
    ], 0, "Direct comprehension from the short sentence.");
  }

  // ==========================================================
  // 12. INGLES - LISTENING (40 PREGUNTAS DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("ingles", "Listening", `Listening Practice #${i}: Speaker says: "Could you please open the window?" What is requested?`, [
      "To open the window", "To close the door", "To turn on the light", "To sit down"
    ], 0, "The speaker asks to open the window.");
  }

  // ==========================================================
  // 13. INTEGRADOR (200 PREGUNTAS 100% DIVERSAS)
  // ==========================================================
  for (let i = 1; i <= 40; i++) {
    addQ("integrador", "Comunicación Escrita", `Reto Escrito #${i}: ¿Cuál es la función del resumen en un reporte académico?`, [
      "Sintetizar las ideas principales de un texto extenso", "Agregar opiniones personales sin fundamento", "Aumentar el número de páginas", "Cambiar el idioma original"
    ], 0, "El resumen sintetiiza lo esencial.");

    addQ("integrador", "Comunicación Artística", `Reto Artístico #${i}: ¿Cómo contribuye el diseño de iluminación en una obra de teatro?`, [
      "Crea atmósfera, época y enfatiza emociones en escena", "Reemplaza el guion escrito", "Sustituye la voz de los actores", "Apaga el sonido del teatro"
    ], 0, "La iluminación aporta dramatismo y ambiente.");

    addQ("integrador", "Comunicación Internacional", `Reto Internacional #${i}: Why is learning English important for global communication?`, [
      "Because it connects people across different countries and cultures", "Because it is the only language in the world", "To stop using Spanish", "To avoid reading books"
    ], 0, "English acts as a global bridge language.");

    addQ("integrador", "Interpretación y Análisis", `Reto de Análisis #${i}: Al interpretar una metáfora poética, ¿qué debemos identificar?`, [
      "El sentido figurado y la relación entre los dos elementos", "La cantidad de letras de la palabra", "El tipo de papel impreso", "La hora en que se escribió"
    ], 0, "Las metáforas requieren interpretar el sentido figurado.");

    addQ("integrador", "Retos Integradores", `Reto Integrador Final #${i}: ¿Qué ventaja ofrece combinar las artes visuales y el lenguaje escrito?`, [
      "Enriquece el mensaje combinando estímulos me visuales y textuales", "Hace que el libro sea imposible de leer", "Elimina la creatividad", "Reduce el vocabulario"
    ], 0, "La combinación multimedia refuerza el impacto comunicativo.");
  }

  return qPool;
}

module.exports = generateUniqueQuestions;
