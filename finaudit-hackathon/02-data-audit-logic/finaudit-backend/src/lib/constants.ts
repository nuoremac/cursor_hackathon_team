/**
 * constants.ts
 * -----------------------------------------------------------------------------
 * Seuils métier centralisés des règles de détection.
 *
 * On les isole ici pour que les valeurs "magiques" soient documentées en un seul
 * endroit, faciles à ajuster pour la démo, et testables de façon déterministe.
 * Le détail des choix (et des ambiguïtés tranchées) est expliqué dans
 * DECISIONS.md.
 */

/** Au-delà de ce montant (strictement), une ligne est jugée "très élevée". */
export const LARGE_AMOUNT_THRESHOLD = 1_000_000;

/** Un montant divisible par cette valeur est considéré comme "rond suspect". */
export const ROUND_AMOUNT_DIVISOR = 100_000;

/**
 * Au-delà de ce seuil, un montant rond bascule de "low" à "medium".
 * (Un petit montant rond est banal ; un gros montant rond l'est moins.)
 */
export const ROUND_AMOUNT_MEDIUM_THRESHOLD = 1_000_000;

/**
 * Montant minimal pour qu'un fournisseur "rare" (vu une seule fois) soit jugé
 * à risque élevé. Volontairement plus bas que LARGE_AMOUNT_THRESHOLD pour
 * capter aussi les fournisseurs uniques au montant "moyennement élevé".
 */
export const RARE_VENDOR_AMOUNT_THRESHOLD = 500_000;

/**
 * Tolérance d'arrondi pour le contrôle d'équilibre débit/crédit.
 * En dessous de cet écart absolu, on considère les comptes comme équilibrés.
 */
export const BALANCE_EPSILON = 0.01;

/** Origines autorisées par CORS (le frontend de la Personne 1 tourne sur :3000). */
export const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
