/**
 * vendorKey.ts
 * -----------------------------------------------------------------------------
 * Normalise un nom de fournisseur en clé de comptage stable.
 *
 * Utilisé à la fois pour construire `vendorCounts` (contexte d'audit) et pour
 * relire ce compteur dans la règle "fournisseur rare", afin que les deux
 * utilisent EXACTEMENT la même normalisation (sinon les comptes ne coïncident
 * pas). On neutralise la casse et les espaces de bord.
 */

export function vendorKey(vendor: string): string {
  return vendor.trim().toLowerCase();
}
