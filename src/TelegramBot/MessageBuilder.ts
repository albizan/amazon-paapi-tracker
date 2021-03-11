import { AmazonProduct } from "../entities/AmazonProduct";

export const discountMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0, seller = "N/A") => {
  return `
    <b>ABBASSAMENTO DI PREZZO</b>\n
    <a href="${savedItem.image}">${savedItem.title}</a>\n
    \nAsin: <code>${savedItem.asin}</code>
    \nCondizione: ${condition}
    \nPrezzo: ${oldPrice}€ => ${price}€
    \nSconto: ${diff.toFixed(2)}%
    \nVenditore: ${seller}`;
};

export const availableAgainMessage = (savedItem: AmazonProduct, price: number, condition: string, seller = "N/A") => {
  return `
    <b>NUOVAMENTE DISPONIBILE</b>\n
    <a href="${savedItem.image}">${savedItem.title}</a>\n
    \nAsin: <code>${savedItem.asin}</code>
    \nCondizione: ${condition}
    \nVenditore: ${seller}`;
};

export const amazonProductInfoMessage = (item: AmazonProduct): string => {
  return `
    <a href="${item.url}">${item.title}</a>\n
    \nAsin: <code>${item.asin}</code>
    \nNuovo: <i>${item.price}€</i>
    \nUsato: ${item.warehousePrice || "N/A"}
    \nVisite: ${item.iterations || 0}
    \nUltima visita: ${item.visitedAt || "N/A"}`;
};
