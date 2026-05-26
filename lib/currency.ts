// Utilitaires pour la gestion des devises

// Taux de change EUR vers XOF (Franc CFA)
export const EUR_TO_XOF_RATE = 655.957

/**
 * Convertit un montant EUR en XOF
 */
export function eurToXof(eurAmount: number): number {
  return Math.round(eurAmount * EUR_TO_XOF_RATE)
}

/**
 * Convertit un montant XOF en EUR
 */
export function xofToEur(xofAmount: number): number {
  return xofAmount / EUR_TO_XOF_RATE
}

/**
 * Formate un montant en fonction du pays
 * - Benin: Affiche en FCFA uniquement
 * - France: Affiche en EUR avec equivalent FCFA
 */
export function formatPrice(amount: number, country: "france" | "benin" = "benin"): string {
  const xofAmount = eurToXof(amount)
  
  if (country === "benin") {
    return `${xofAmount.toLocaleString('fr-FR')} FCFA`
  } else {
    // France: EUR + equivalent FCFA
    return `${amount.toFixed(2)} EUR (${xofAmount.toLocaleString('fr-FR')} FCFA)`
  }
}

/**
 * Formate un montant en FCFA uniquement
 */
export function formatFCFA(amount: number): string {
  const xofAmount = eurToXof(amount)
  return `${xofAmount.toLocaleString('fr-FR')} FCFA`
}

/**
 * Formate un montant en EUR uniquement
 */
export function formatEUR(amount: number): string {
  return `${amount.toFixed(2)} EUR`
}

/**
 * Formate un prix pour l'affichage (version courte pour les cartes)
 * - Benin: FCFA
 * - France: EUR
 */
export function formatPriceShort(amount: number, country: "france" | "benin" = "benin"): string {
  if (country === "benin") {
    const xofAmount = eurToXof(amount)
    return `${xofAmount.toLocaleString('fr-FR')} FCFA`
  } else {
    return `${amount.toFixed(2)} EUR`
  }
}

/**
 * Affiche le prix complet avec les deux devises
 */
export function formatPriceFull(amount: number): { eur: string; fcfa: string } {
  const xofAmount = eurToXof(amount)
  return {
    eur: `${amount.toFixed(2)} EUR`,
    fcfa: `${xofAmount.toLocaleString('fr-FR')} FCFA`
  }
}
