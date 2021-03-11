import { AmazonProduct } from "../entities/AmazonProduct";

export const discountMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0, seller = "N/A") => {
  return `
    <b>ABBASSAMENTO DI PREZZO</b>\n
    \n<a href="${savedItem.image}">${savedItem.title}</a>
    \nAsin: <code>${savedItem.asin}</code>
    \nCondizione: ${condition}
    \nPrezzo: <i>${oldPrice}€ => ${price}€</i>
    \nSconto: ${diff.toFixed(2)}%
    \nVenditore: ${seller}
    \n<a href="${savedItem.url}">Premi per aprire amazon</a>`;
};

export const availableAgainMessage = (savedItem: AmazonProduct, price: number, condition: string, seller = "N/A") => {
  return `
    <b>NUOVAMENTE DISPONIBILE</b>\n
    \n<a href="${savedItem.image}">${savedItem.title}</a>
    \nAsin: <code>${savedItem.asin}</code>
    \nCondizione: ${condition}
    \nPrezzo: <i>${price}€</i>
    \nVenditore: ${seller}
    \n<a href="${savedItem.url}">Premi per aprire amazon</a>`;
};

export const amazonProductInfoMessage = (item: AmazonProduct): string => {
  const price = item.price ? item.price + "€" : "N/A";
  const warehousePrice = item.warehousePrice ? item.warehousePrice + "€" : "N/A";
  return `
    <b>INFORMAZIONI PRODOTTO</b>\n
    \n<a href="${item.image}">${item.title}</a>
    \nAsin: <code>${item.asin}</code>
    \nPrezzo: <i>${price}</i>
    \nPrezzo usato: <i>${warehousePrice}</i>
    \nVisite: ${item.iterations || 0}
    \nUltima visita: ${item.visitedAt || "N/A"}
    \n<a href="${item.url}">Premi per aprire amazon</a>`;
};
