// Utilitaires pour la gestion des devises

// Taux de change EUR vers XOF (Franc CFA)
export const EUR_TO_XOF_RATE = 655.957

/**
 * Convertit un montant EUR en XOF
 */
export function eurToXof(eurAmount: number | string): number {
  const num = typeof eurAmount === "string" ? parseFloat(eurAmount) : eurAmount
  return Math.round(num * EUR_TO_XOF_RATE)
}

/**
 * Convertit un montant XOF en EUR
 */
export function xofToEur(xofAmount: number | string): number {
  const num = typeof xofAmount === "string" ? parseFloat(xofAmount) : xofAmount
  return num / EUR_TO_XOF_RATE
}

/**
 * Formate un montant en fonction du pays
 * - Benin: Affiche en FCFA uniquement
 * - France: Affiche en EUR avec equivalent FCFA
 */
export function formatPrice(amount: number | string, country: "france" | "benin" = "benin"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  const xofAmount = eurToXof(num)

  if (country === "benin") {
    return `${xofAmount.toLocaleString('fr-FR')} FCFA`
  } else {
    // France: EUR + equivalent FCFA
    return `${num.toFixed(2)} EUR (${xofAmount.toLocaleString('fr-FR')} FCFA)`
  }
}

/**
 * Formate un montant en FCFA uniquement
 */
export function formatFCFA(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  const xofAmount = eurToXof(num)
  return `${xofAmount.toLocaleString('fr-FR')} FCFA`
}

/**
 * Formate un montant en EUR uniquement
 */
export function formatEUR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  return `${num.toFixed(2)} EUR`
}

/**
 * Formate un prix pour l'affichage (version courte pour les cartes)
 * - Benin: FCFA
 * - France: EUR
 */
export function formatPriceShort(amount: number | string, country: "france" | "benin" = "benin"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (country === "benin") {
    const xofAmount = eurToXof(num)
    return `${xofAmount.toLocaleString('fr-FR')} FCFA`
  } else {
    return `${num.toFixed(2)} EUR`
  }
}

/**
 * Affiche le prix complet avec les deux devises
 */
export function formatPriceFull(amount: number | string): { eur: string; fcfa: string } {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  const xofAmount = eurToXof(num)
  return {
    eur: `${num.toFixed(2)} EUR`,
    fcfa: `${xofAmount.toLocaleString('fr-FR')} FCFA`
  }
}
