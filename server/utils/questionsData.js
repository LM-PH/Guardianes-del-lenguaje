// Banco de preguntas educativas reales por materia y zona
const questionsPool = {
  espanol: {
    "Ortografía": [
      {
        question: "¿Cuál de las siguientes palabras está escrita correctamente?",
        options: ["Hervir", "Herbir", "Erving", "Ervir"],
        correctAnswer: 0,
        explanation: "El verbo 'hervir' se escribe con 'h' y 'v'."
      },
      {
        question: "Selecciona la palabra que lleva tilde por ser aguda terminada en vocal:",
        options: ["Café", "Mesa", "Árbol", "Lápiz"],
        correctAnswer: 0,
        explanation: "Café es una palabra aguda que termina en vocal, por lo tanto debe llevar tilde."
      },
      {
        question: "Identifica la opción que utiliza correctamente los signos de interrogación:",
        options: ["¿Cómo estás?", "Cómo estás?", "¿Cómo estás", "Cómo estás!"],
        correctAnswer: 0,
        explanation: "En español se deben usar obligatoriamente los signos de apertura (¿) y de cierre (?)."
      }
    ],
    "Comprensión lectora": [
      {
        question: "Si decimos: 'El perro corre feliz por el parque persiguiendo su pelota'. ¿Quién persigue la pelota?",
        options: ["El perro", "El parque", "La pelota", "El dueño"],
        correctAnswer: 0,
        explanation: "El sujeto que realiza la acción en la oración es 'el perro'."
      },
      {
        question: "En la frase: 'La lluvia caía sin cesar, inundando las calles'. ¿Qué significa 'sin cesar'?",
        options: ["Que no se detenía", "Que llovía poco", "Que hacía sol", "Que era divertido"],
        correctAnswer: 0,
        explanation: "'Sin cesar' significa de forma continua, sin interrupción o pausa."
      },
      {
        question: "Lee: 'Sofía preparó un pastel de fresa para el cumpleaños de su madre'. ¿Para quién es el pastel?",
        options: ["Para la madre de Sofía", "Para Sofía", "Para las amigas", "Para el padre"],
        correctAnswer: 0,
        explanation: "El texto especifica textualmente que el pastel fue preparado para el cumpleaños de su madre."
      }
    ],
    "Literatura": [
      {
        question: "¿Qué tipo de texto suele escribirse en verso y expresar sentimientos o emociones del autor?",
        options: ["Poema", "Noticia", "Receta de cocina", "Manual de instrucciones"],
        correctAnswer: 0,
        explanation: "El poema es la composición poética escrita en verso para transmitir sensaciones y emociones."
      },
      {
        question: "¿Cuál de los siguientes es un subgénero narrativo que relata historias fantásticas con animales y una moraleja?",
        options: ["Fábula", "Poesía", "Ensayo científico", "Crónica periodística"],
        correctAnswer: 0,
        explanation: "La fábula cuenta relatos ficticios breves con fines didácticos (moraleja) y personajes animales."
      },
      {
        question: "¿Quién es el autor de la famosa novela clásica 'Don Quijote de la Mancha'?",
        options: ["Miguel de Cervantes", "Gabriel García Márquez", "Federico García Lorca", "Pablo Neruda"],
        correctAnswer: 0,
        explanation: "Miguel de Cervantes Saavedra es el autor de esta joya de la literatura universal."
      }
    ],
    "Producción de textos": [
      {
        question: "¿Qué palabra funciona como conector de oposición en: 'Estudió mucho, ___ no aprobó el examen'?",
        options: ["pero", "porque", "entonces", "además"],
        correctAnswer: 0,
        explanation: "'Pero' es una conjunción adversativa que denota contraste u oposición."
      },
      {
        question: "Identifica el sujeto en: 'Ayer por la tarde, los estudiantes terminaron el proyecto escolar'.",
        options: ["los estudiantes", "el proyecto escolar", "Ayer por la tarde", "terminaron"],
        correctAnswer: 0,
        explanation: "'Los estudiantes' es el sintagma nominal que realiza la acción verbal de terminar el proyecto."
      },
      {
        question: "¿Cuál es el propósito principal de redactar un texto de tipo argumentativo?",
        options: ["Persuadir o convencer sobre una postura", "Narrar una historia de ficción", "Explicar un experimento técnico", "Dar instrucciones de uso"],
        correctAnswer: 0,
        explanation: "Los textos argumentativos defienden una tesis para persuadir e influir en la opinión del lector."
      }
    ]
  },
  artes: {
    "Artes visuales": [
      {
        question: "¿Cuáles son los tres colores primarios en la pintura artística?",
        options: ["Rojo, amarillo y azul", "Verde, naranja y morado", "Blanco, negro y gris", "Rojo, verde y azul"],
        correctAnswer: 0,
        explanation: "El modelo tradicional RYB define al rojo, amarillo y azul como colores primarios base."
      },
      {
        question: "¿Cómo se obtiene el color secundario verde al mezclar pinturas?",
        options: ["Mezclando azul y amarillo", "Mezclando rojo y azul", "Mezclando amarillo y rojo", "Mezclando blanco y negro"],
        correctAnswer: 0,
        explanation: "El verde se origina de la mezcla equilibrada de azul y amarillo."
      },
      {
        question: "¿Qué técnica artística consiste en pegar pedazos de papel u otros materiales en un lienzo?",
        options: ["Colaje (Collage)", "Acuarela", "Escultura de mármol", "Grabado en metal"],
        correctAnswer: 0,
        explanation: "El collage es una composición artística que pega fragmentos diversos sobre una superficie."
      }
    ],
    "Música": [
      {
        question: "¿Cuál es la nota musical que sigue inmediatamente a 'Sol' en sentido ascendente?",
        options: ["La", "Fa", "Si", "Do"],
        correctAnswer: 0,
        explanation: "La sucesión de notas musicales es: Do, Re, Mi, Fa, Sol, La, Si."
      },
      {
        question: "¿Qué cualidad del sonido nos permite identificar si un sonido es fuerte o débil?",
        options: ["Intensidad", "Tono", "Timbre", "Duración"],
        correctAnswer: 0,
        explanation: "La intensidad (equivalente al volumen) define la potencia y fuerza de la vibración sonora."
      },
      {
        question: "¿Cuál de los siguientes instrumentos de viento se clasifica clásicamente como de viento-madera?",
        options: ["Flauta dulce", "Violín", "Tambor de marcha", "Trompeta metálica"],
        correctAnswer: 0,
        explanation: "La flauta dulce se clasifica en viento-madera por su mecanismo físico acústico histórico."
      }
    ],
    "Danza": [
      {
        question: "¿Cómo se denomina al elemento de la danza que coordina los movimientos con el tiempo y la música?",
        options: ["Ritmo", "Escenografía", "Pintura facial", "Proyección de luces"],
        correctAnswer: 0,
        explanation: "El ritmo ordena corporal y temporalmente el movimiento expresivo con el pulso musical."
      },
      {
        question: "¿Qué recurso expresivo es vital en la danza para proyectar emociones sin usar palabras?",
        options: ["Expresión corporal y gestual", "El valor del vestuario", "La dimensión del tablado", "La hora del espectáculo"],
        correctAnswer: 0,
        explanation: "La expresión del cuerpo y la gestualidad transmiten directamente los estados anímicos."
      },
      {
        question: "¿Cuál es un baile folclórico tradicional de México donde los bailarines golpean el suelo?",
        options: ["El Jarabe Tapatío (Zapateado)", "El Ballet clásico ruso", "El Tango de salón", "El Breakdance urbano"],
        correctAnswer: 0,
        explanation: "El zapateado es el golpe rítmico de los pies contra el tablado en jarabes y sones tradicionales."
      }
    ],
    "Teatro": [
      {
        question: "¿Cómo se llama el texto escrito que guía a los actores y directores en la puesta en escena?",
        options: ["Guion o Libreto", "Novela de suspenso", "Artículo de opinión", "Canción popular"],
        correctAnswer: 0,
        explanation: "El guion teatral contiene las intervenciones dialogadas y todas las acotaciones técnicas."
      },
      {
        question: "¿Cómo se les llama a las acotaciones o anotaciones sobre gestos y movimientos en un guion teatral?",
        options: ["Acotaciones", "Monólogos", "Escenarios", "Clímax"],
        correctAnswer: 0,
        explanation: "Las acotaciones (generalmente entre paréntesis) indican la acción física y estado emocional."
      },
      {
        question: "¿Qué es un monólogo dentro de la estructura de una obra teatral?",
        options: ["Un parlamento extenso que hace un personaje en solitario", "Un diálogo veloz entre dos protagonistas", "El decorado plástico del escenario", "La partitura instrumental de la obra"],
        correctAnswer: 0,
        explanation: "El monólogo o soliloquio es el discurso reflexivo que realiza un actor a solas para sí o para el público."
      }
    ]
  },
  ingles: {
    "Vocabulary": [
      {
        question: "What domestic animal is known as 'man's best friend' and barks?",
        options: ["Dog", "Cat", "Parrot", "Goldfish"],
        correctAnswer: 0,
        explanation: "Dogs bark and are famously regarded as loyal companions or 'man's best friend'."
      },
      {
        question: "Which color is created when you mix red and yellow paints?",
        options: ["Orange", "Pink", "Purple", "Green"],
        correctAnswer: 0,
        explanation: "Mixing red and yellow primary colors yields orange, which is a secondary color."
      },
      {
        question: "What school tool is used to erase errors written in pencil?",
        options: ["Eraser", "Notebook", "Ruler", "Pencil sharpener"],
        correctAnswer: 0,
        explanation: "An eraser rubbing against paper removes graphite marks made by pencils."
      }
    ],
    "Grammar": [
      {
        question: "Complete the sentence correctly: 'She ___ a brilliant student at the language academy.'",
        options: ["is", "am", "are", "be"],
        correctAnswer: 0,
        explanation: "'Is' is the correct form of the verb to be for third-person singular pronouns (he, she, it)."
      },
      {
        question: "Choose the correct preposition: 'The English book is ___ the table.' (sobre la mesa)",
        options: ["on", "under", "in", "behind"],
        correctAnswer: 0,
        explanation: "'On' denotes that the object is in contact with and supported by the upper surface."
      },
      {
        question: "Identify the sentence written in the Simple Present tense:",
        options: ["He walks to school every morning.", "He walked to school yesterday.", "He is going to walk to school.", "He will walk to school."],
        correctAnswer: 0,
        explanation: "'walks' uses the third person present inflection expressing a daily routine."
      }
    ],
    "Reading": [
      {
        question: "Read: 'Lucas lives in Paris. He has a cat named Leo and a yellow canary named Sunny.' What animal is Sunny?",
        options: ["A canary (bird)", "A cat", "A dog", "A fish"],
        correctAnswer: 0,
        explanation: "The text describes Sunny as 'a yellow canary', so Sunny is a bird."
      },
      {
        question: "Read: 'Sarah is an architect. She designs beautiful houses at her downtown studio.' What is Sarah's job?",
        options: ["Architect", "Doctor", "Teacher", "Artist"],
        correctAnswer: 0,
        explanation: "The text says 'Sarah is an architect', describing her profession directly."
      },
      {
        question: "Read: 'The bakery is between the bookstore and the coffee shop.' Where is the bakery?",
        options: ["Between the bookstore and the coffee shop", "Next to the supermarket", "Behind the hospital", "Opposite the park"],
        correctAnswer: 0,
        explanation: "The text uses 'between', meaning the bakery is located in the middle of those two shops."
      }
    ],
    "Listening": [
      {
        question: "Pronounce clearly: 'I love learning new languages every day'",
        type: "voice",
        expectedAnswer: "I love learning new languages every day",
        explanation: "Practica tu fluidez, pronunciación y entonación en inglés."
      },
      {
        question: "Pronounce clearly: 'Hello teacher my name is Miguel'",
        type: "voice",
        expectedAnswer: "Hello teacher my name is Miguel",
        explanation: "Una frase básica de presentación y saludo formal."
      },
      {
        question: "Pronounce clearly: 'Can you help me with this exercise please'",
        type: "voice",
        expectedAnswer: "Can you help me with this exercise please",
        explanation: "Frase cortés utilizada para solicitar asistencia académica."
      }
    ]
  },
  integrador: {
    "Comunicación Escrita": [
      {
        question: "Elige la palabra que completa la idea: 'Para redactar un informe formal se requiere un lenguaje ___'.",
        options: ["claro y formal", "coloquial y lleno de abreviaciones", "en clave secreta", "desordenado y cómico"],
        correctAnswer: 0,
        explanation: "Los reportes académicos o profesionales exigen un léxico objetivo, claro y formal."
      },
      {
        question: "¿Qué signo de puntuación utilizamos al final de una oración enunciativa completa?",
        options: ["El punto (.)", "La coma (,)", "Los dos puntos (:)", "El signo de exclamación (!)"],
        correctAnswer: 0,
        explanation: "El punto delimita oraciones y marca el final de una idea o texto."
      }
    ],
    "Comunicación Artística": [
      {
        question: "¿Qué elemento compartitivo es vital tanto en una pintura decorativa como en los focos del escenario teatral?",
        options: ["La luz y el color", "El tamaño físico del cuadro", "El costo de las lámparas", "La marca de la pintura"],
        correctAnswer: 0,
        explanation: "Tanto la iluminación teatral como el matiz del lienzo crean atmósfera mediante el color y luz."
      },
      {
        question: "¿Qué espectáculo integra el canto, la ejecución musical en vivo, la actuación y la danza?",
        options: ["La ópera y el teatro musical", "La lectura silenciosa de novelas", "La muestra de esculturas", "El dibujo técnico digital"],
        correctAnswer: 0,
        explanation: "Las artes escénicas musicales coordinan armónicamente música, actuación y canto."
      }
    ],
    "Comunicación Internacional": [
      {
        question: "Translate to English: 'Buenos días, ¿dónde está el salón de clases?'",
        options: ["Good morning, where is the classroom?", "Good afternoon, what is your name?", "Good morning, where is the library?", "Hello, how are you today?"],
        correctAnswer: 0,
        explanation: "'Good morning, where is the classroom?' es la traducción fiel de la oración."
      },
      {
        question: "If someone greets you formally asking 'How do you do?', what is the most polite response?",
        options: ["How do you do?", "I am ten years old.", "I love apples.", "Not really."],
        correctAnswer: 0,
        explanation: "'How do you do?' se responde idénticamente en saludos formales."
      }
    ],
    "Interpretación y Análisis": [
      {
        question: "En la fábula clásica de la liebre y la tortuga, ¿cuál es la enseñanza moral principal?",
        options: ["Que la constancia y el esfuerzo constante superan la arrogancia", "Que ir rápido siempre causa daño", "Que las tortugas corren más rápido que las liebres", "Que las competencias son innecesarias"],
        correctAnswer: 0,
        explanation: "La moraleja exalta el valor del esfuerzo continuo frente a la soberbia del que se confía."
      },
      {
        question: "Lee: 'El agua potable es vital pero escasa en el planeta'. ¿Qué medida promueve su cuidado directo?",
        options: ["Cerrar la llave mientras nos enjabonamos las manos", "Tomar duchas de más de media hora", "Regar la banqueta pública con manguera", "Ignorar las fugas del baño"],
        correctAnswer: 0,
        explanation: "Evitar el flujo continuo de agua innecesario ayuda a mitigar la escasez del recurso."
      }
    ],
    "Retos Integradores": [
      {
        question: "Pronounce clearly: 'Knowledge is the path to unlock the doors of the world'",
        type: "voice",
        expectedAnswer: "Knowledge is the path to unlock the doors of the world",
        explanation: "Combina habilidades de pronunciación en inglés e interpretación del conocimiento como llave global."
      },
      {
        question: "Pronounce clearly: 'Welcome to the language academy of the guardians'",
        type: "voice",
        expectedAnswer: "Welcome to the language academy of the guardians",
        explanation: "Reto oral integrador para validar tu dicción de bienvenida."
      }
    ]
  }
};

module.exports = questionsPool;
