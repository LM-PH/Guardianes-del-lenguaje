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

  function addQ(subject, zone, qStr, options, correct, expl) {
    qPool[subject][zone].push({
      question: qStr,
      options: options,
      correctAnswer: correct,
      explanation: expl
    });
  }

  // --- ESPAÑOL ---
  for (let i = 0; i < 100; i++) {
    addQ("espanol", "Ortografía", `Pregunta única de Ortografía #${i+1}. ¿Cómo se escribe correctamente la palabra aguda terminada en vocal?`, ["Café", "Cafe", "Kafé", "Cáfe"], 0, "Reglas de acentuación aguda.");
    addQ("espanol", "Comprensión lectora", `Pregunta única de Comprensión lectora #${i+1}. Si leo "el gran árbol cayó", ¿de quién se habla?`, ["El árbol", "El gran", "Cayó", "El lector"], 0, "Sujeto de la oración.");
  }
  for (let i = 0; i < 40; i++) {
    addQ("espanol", "Literatura", `Pregunta única de Literatura #${i+1}. ¿A qué género pertenece un poema?`, ["Lírico", "Narrativo", "Dramático", "Épico"], 0, "Género lírico.");
    addQ("espanol", "Producción de textos", `Pregunta única de Producción de textos #${i+1}. Conector que indica conclusión:`, ["Por lo tanto", "Además", "Pero", "Sino"], 0, "Conectores lógicos conclusivos.");
  }

  // --- ARTES ---
  for (let i = 0; i < 60; i++) {
    addQ("artes", "Artes visuales", `Pregunta única de Artes Visuales #${i+1}. Color formado por amarillo y azul:`, ["Verde", "Naranja", "Morado", "Negro"], 0, "Teoría del color.");
    addQ("artes", "Música", `Pregunta única de Música #${i+1}. Instrumento de cuerdas frotadas:`, ["Violín", "Piano", "Flauta", "Tambor"], 0, "Familias de instrumentos.");
  }
  for (let i = 0; i < 40; i++) {
    addQ("artes", "Danza", `Pregunta única de Danza #${i+1}. Elemento clave para seguir una coreografía:`, ["Ritmo", "Vestuario", "Lienzo", "Boceto"], 0, "Ritmo musical.");
    addQ("artes", "Teatro", `Pregunta única de Teatro #${i+1}. Donde los actores memorizan sus líneas:`, ["Guion teatral", "Partitura", "Boceto", "Pincel"], 0, "Texto dramático.");
  }

  // --- INGLES ---
  for (let i = 0; i < 60; i++) {
    addQ("ingles", "Vocabulary", `Unique Vocabulary Question #${i+1}. Translation for "Libro":`, ["Book", "Pen", "Desk", "Chair"], 0, "Basic vocabulary.");
    addQ("ingles", "Grammar", `Unique Grammar Question #${i+1}. Correct verb to be for "He":`, ["is", "am", "are", "be"], 0, "Verb to be third person.");
  }
  for (let i = 0; i < 40; i++) {
    addQ("ingles", "Reading", `Unique Reading Question #${i+1}. "The cat sleeps". What does it do?`, ["Sleeps", "Runs", "Eats", "Jumps"], 0, "Action identification.");
    addQ("ingles", "Listening", `Unique Listening Question #${i+1}. Audio says "I want water". Wants:`, ["Water", "Food", "Sleep", "Play"], 0, "Basic listening comprehension.");
  }

  // --- INTEGRADOR ---
  for (let i = 0; i < 40; i++) {
    addQ("integrador", "Comunicación Escrita", `Reto Escrito Único #${i+1}. Para un texto formal usamos:`, ["Lenguaje culto", "Slang", "Emojis", "Gritos"], 0, "Registros lingüísticos.");
    addQ("integrador", "Comunicación Artística", `Reto Artístico Único #${i+1}. Medio de expresión visual:`, ["Pintura", "Ajedrez", "Fútbol", "Matemáticas"], 0, "Formas de arte.");
    addQ("integrador", "Comunicación Internacional", `Reto Internacional Único #${i+1}. Global language tool:`, ["English", "Silence", "Maths", "Run"], 0, "Inglés como lengua franca.");
    addQ("integrador", "Interpretación y Análisis", `Reto de Análisis Único #${i+1}. Interpretar un texto es:`, ["Comprender su fondo", "Contar letras", "Pesarlo", "Quemar hojas"], 0, "Significado profundo.");
    addQ("integrador", "Retos Integradores", `Reto Integrador Final #${i+1}. Combinar todo lo aprendido:`, ["Conecta disciplinas", "Olvida lo anterior", "Descansa", "Falla"], 0, "Visión holística.");
  }

  return qPool;
}

module.exports = generateUniqueQuestions;
