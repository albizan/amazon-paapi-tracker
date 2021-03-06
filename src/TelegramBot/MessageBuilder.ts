import { AmazonProduct } from "../entities/AmazonProduct";

export const defaultMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0) => {
  return `<a href="${savedItem.url}">${savedItem.title}</a>\nCondizione: ${condition}\nPrezzo: ${oldPrice} => ${price}\n${
    diff ? `<b>Sconto: ${diff.toFixed(2)}</b>` : ""
  }`;
};

export const amazonProductInfoMessage = (item: AmazonProduct): string => {
  return `
    <a href="${item.url}">${item.title}</a>
    \nAsin: ${item.asin}
    \nNuovo: ${item.price}
    \nUsato: ${item.warehousePrice}
    \nVisite: ${item.iterations || 0}
    \nUltima visita: ${item.visitedAt || "N/A"}`;
};
