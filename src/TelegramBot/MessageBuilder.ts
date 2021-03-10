import { AmazonProduct } from "../entities/AmazonProduct";

export const defaultMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0, seller = null) => {
  return `<a href="${savedItem.url}">${savedItem.title}</a>\n\n\nCondizione: ${condition}\nPrezzo: ${oldPrice}€ => ${price}€\n${
    diff ? `<b>Sconto: ${diff.toFixed(2)}</b>` : ""
  }\n${seller ? `<b>Seller: ${seller}</b>` : ""}`;
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
