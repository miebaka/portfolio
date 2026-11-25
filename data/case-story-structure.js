/* Shared chapter contract for every published portfolio case study.
   Labels and questions live here so every renderer uses exactly the same language. */
export const CASE_STORY_STRUCTURE = Object.freeze([
  Object.freeze({
    id: "context",
    label: "The Context",
    descriptor: "What was the brief, and what constraints shaped it?",
  }),
  Object.freeze({
    id: "decision",
    label: "The Decision",
    descriptor: "What did I decide, and what did I turn down to get there?",
  }),
  Object.freeze({
    id: "system",
    label: "The System",
    descriptor: "What did I build so the decision outlived the first week?",
  }),
  Object.freeze({
    id: "survival",
    label: "What Survived",
    descriptor: "What did the deadline and the budget leave standing?",
  }),
  Object.freeze({
    id: "encounter",
    label: "First Contact",
    descriptor: "How did the people it was made for first meet it?",
  }),
  Object.freeze({
    id: "results",
    label: "The Results",
    descriptor: "What changed because this existed, and how do I know?",
  }),
]);
