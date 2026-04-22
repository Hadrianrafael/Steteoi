/**
 * In-App Purchase product catalog for Empire Clash.
 *
 * To enable real Google Play Billing on a production build:
 * 1. Create matching SKUs in Google Play Console > Monetize > Products.
 * 2. Install `react-native-iap` (or RevenueCat for cross-store support).
 * 3. Replace `purchaseProduct` body with the SDK call.
 *
 * The SKU strings here are the source of truth — keep them in sync with Play.
 */

export type IAPProduct = {
  sku: string;
  type: "consumable" | "subscription" | "non_consumable";
  title: string;
  reward: { coins?: number; gems?: number; vipDays?: number };
  priceBRL: string;
};

export const IAP_CATALOG: IAPProduct[] = [
  // Coin packs
  { sku: "coins_500", type: "consumable", title: "500 Moedas", reward: { coins: 500 }, priceBRL: "R$ 4,90" },
  { sku: "coins_1500", type: "consumable", title: "1.500 Moedas + 100 bônus", reward: { coins: 1600 }, priceBRL: "R$ 9,90" },
  { sku: "coins_5000", type: "consumable", title: "5.000 Moedas + 800 bônus", reward: { coins: 5800 }, priceBRL: "R$ 24,90" },
  { sku: "coins_15000", type: "consumable", title: "15.000 Moedas + 4.000 bônus", reward: { coins: 19000 }, priceBRL: "R$ 74,90" },

  // Gem packs
  { sku: "gems_30", type: "consumable", title: "30 Gemas", reward: { gems: 30 }, priceBRL: "R$ 4,90" },
  { sku: "gems_90", type: "consumable", title: "90 Gemas + 10 bônus", reward: { gems: 100 }, priceBRL: "R$ 9,90" },
  { sku: "gems_300", type: "consumable", title: "300 Gemas + 50 bônus", reward: { gems: 350 }, priceBRL: "R$ 24,90" },
  { sku: "gems_1000", type: "consumable", title: "1.000 Gemas + 250 bônus", reward: { gems: 1250 }, priceBRL: "R$ 74,90" },

  // VIP
  { sku: "vip_monthly", type: "subscription", title: "Passe VIP Mensal", reward: { vipDays: 30 }, priceBRL: "R$ 19,90" },

  // Combos
  { sku: "combo_war", type: "consumable", title: "Combo Guerra", reward: { coins: 2000, gems: 50 }, priceBRL: "R$ 14,90" },
  { sku: "combo_fleet", type: "consumable", title: "Combo Frota", reward: { gems: 100 }, priceBRL: "R$ 29,90" },
];

export type PurchaseResult =
  | { success: true; product: IAPProduct; transactionId: string }
  | { success: false; reason: "cancelled" | "unavailable" | "error"; message?: string };

/**
 * Purchase a product. In dev this is mocked.
 * In production replace with `react-native-iap`:
 *
 *   import { requestPurchase, getProducts } from 'react-native-iap';
 *   await getProducts({ skus: [sku] });
 *   const purchase = await requestPurchase({ skus: [sku] });
 *   await finishTransaction({ purchase, isConsumable });
 */
export async function purchaseProduct(sku: string): Promise<PurchaseResult> {
  const product = IAP_CATALOG.find((p) => p.sku === sku);
  if (!product) {
    return { success: false, reason: "unavailable", message: "SKU desconhecido" };
  }
  return {
    success: false,
    reason: "unavailable",
    message: "Compras reais ativam apenas na build da Play Store.",
  };
}

export function findProduct(sku: string): IAPProduct | undefined {
  return IAP_CATALOG.find((p) => p.sku === sku);
}
