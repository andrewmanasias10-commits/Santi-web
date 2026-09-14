-- ============================================================================
-- SANTI · Posts de ejemplo (opcional). Correr DESPUÉS de schema.sql.
-- Supabase → SQL Editor → New query → pegar → Run.
-- ============================================================================

insert into public.posts (slug, title, excerpt, category, color, author, date, reading_minutes, body, published)
values
(
  'que-es-la-neurodivergencia',
  '¿Qué es la neurodivergencia? Una guía para padres',
  'Entender la neurodivergencia es el primer paso para acompañar mejor. Te explicamos qué significa y por qué importa la mirada respetuosa.',
  'Neurodivergencia', 'sky', 'Equipo SANTI', '2025-09-15', 5,
  $body$La neurodivergencia describe las variaciones naturales en la forma en que funcionan nuestros cerebros. No se trata de algo que haya que "arreglar", sino de reconocer que existen distintas maneras de pensar, aprender y relacionarse con el mundo.

## Cada persona es diferente
En SANTI creemos que todos somos diferentes, y esa diversidad es valiosa. Un niño neurodivergente puede tener fortalezas notables junto a desafíos en ciertas áreas. Nuestro trabajo es partir de sus fortalezas.

## ¿Por qué importa la mirada?
La sociedad a menudo espera que las personas neurodivergentes se adapten a las normas neurotípicas. Cambiar esa mirada transforma la experiencia de toda la familia.

- Observa y celebra las fortalezas de tu hijo o hija.
- Busca apoyo temprano y basado en evidencia.
- Recuerda que el desarrollo ocurre también fuera de la sesión, en casa.

Si tienes dudas sobre el desarrollo de tu hijo, escríbenos. Estamos para acompañarte.$body$,
  true
),
(
  'rutinas-en-casa-que-ayudan',
  '5 rutinas en casa que apoyan el desarrollo',
  'Pequeños cambios en la rutina diaria pueden marcar una gran diferencia. Aquí cinco ideas prácticas para aplicar desde hoy.',
  'Desarrollo infantil', 'orange', 'Equipo SANTI', '2025-10-02', 4,
  $body$Las habilidades que más importan son las que se usan en la vida real. Por eso, la rutina en casa es una gran aliada del proceso terapéutico.

## 1. Anticipa el día
Cuéntale a tu hijo qué va a pasar. Una agenda visual sencilla reduce la incertidumbre y la ansiedad.

## 2. Refuerza lo positivo
Reconoce los logros, por pequeños que sean. El reforzamiento positivo motiva a repetir las conductas deseadas.

## 3. Divide las tareas en pasos
Enseñar paso a paso hace que las tareas grandes se vuelvan alcanzables.

## 4. Cuida los tiempos de descanso
El equilibrio entre estímulo y descanso favorece la regulación.

## 5. Practica lo aprendido en sesión
Continuar en casa los programas trabajados en el consultorio multiplica los resultados.$body$,
  true
),
(
  'aba-en-casa-participacion-de-los-padres',
  'ABA en casa: por qué tu participación es clave',
  'En SANTI los padres participan activamente en la sesión. Te contamos cómo esto acelera el progreso de tu hijo.',
  'ABA', 'pink', 'Equipo SANTI', '2025-10-20', 6,
  $body$Nuestro modelo está adaptado al contexto latinoamericano: los padres aprenden a aplicar los programas en sesión y luego los practican en casa.

## El aprendizaje se generaliza
Cuando una habilidad se practica solo en el consultorio, corre el riesgo de quedarse allí. Al llevarla a casa, el aprendizaje se generaliza a la vida real.

## Padres como aliados terapéuticos
No se trata de convertir a los padres en terapeutas, sino de darles herramientas concretas y confianza para acompañar el día a día.

- Participas en la sesión de 45 minutos.
- Recibes entrenamiento directo para continuar en casa.
- Ves el progreso medido semana a semana.

La coherencia entre el hogar, la terapia y otros entornos es lo que genera cambios sostenibles.$body$,
  true
)
on conflict (slug) do nothing;
