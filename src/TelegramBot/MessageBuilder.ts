import { AmazonProduct } from "../entities/AmazonProduct";

export const discountMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0, seller = "N/A") => {
  return `<a href='${savedItem.image}'>&#8204;</a><b>${diff.toFixed(2)}% di ribasso</b>\n
    \n${savedItem.title}
    \nAsin: <code>${savedItem.asin}</code>
    \nCondizione: ${condition}
    \nPrezzo: <i>${oldPrice}€ => ${price}€</i>
    \nSconto: ${diff.toFixed(2)}%
    \nVenditore: ${seller}
    \n<a href="${savedItem.url}">Premi per aprire amazon</a>`;
};

export const availableAgainMessage = (savedItem: AmazonProduct, price: number, condition: string, seller = "N/A") => {
  return `<a href='${savedItem.image}'>&#8204;</a><b>NUOVAMENTE DISPONIBILE</b>\n
    \n${savedItem.title}
    \nAsin: <code>${savedItem.asin}</code>
    \nCondizione: ${condition}
    \nPrezzo: <i>${price}€</i>
    \nVenditore: ${seller}
    \n<a href="${savedItem.url}">Premi per aprire amazon</a>`;
};

export const amazonProductInfoMessage = (item: AmazonProduct): string => {
  const price = item.price ? item.price + "€" : "N/A";
  const warehousePrice = item.warehousePrice ? item.warehousePrice + "€" : "N/A";
  let latestNotification;
  let latestNotificationWarehouse;
  if (item.lastNotifiedNew > 0) {
    const millis = Date.now() - item.lastNotifiedNew;
    latestNotification = (millis / 1000 / 60).toFixed(0) + " minuti fa";
  } else {
    latestNotification = "Nessuna";
  }
  if (item.lastNotifiedWarehouse > 0) {
    const millis = Date.now() - item.lastNotifiedWarehouse;
    latestNotificationWarehouse = (millis / 1000 / 60).toFixed(0) + " minuti fa";
  } else {
    latestNotificationWarehouse = "Nessuna";
  }
  return `
    <a href='${item.image}'>&#8204;</a>
    \n<b>INFORMAZIONI PRODOTTO</b>\n
    \n${item.title}
    \nAsin: <code>${item.asin}</code>
    \nPrezzo: <i>${price}</i>
    \nPrezzo usato: <i>${warehousePrice}</i>
    \nVisite: ${item.iterations || 0}
    \nUltima visita: ${item.visitedAt || "N/A"}
    \nNotifica [Nuovo]: ${latestNotification}
    \nNotifica [Usato]: ${latestNotificationWarehouse}
    \n<a href="${item.url}">Premi per aprire amazon</a>`;
};

export const createItemLink = (asin: string) => {
  return `https://www.amazon.it/dp/${asin}?tag=wasabe-21`;
};

export const createListingLink = (asin: string) => {
  return `https://www.amazon.it/gp/offer-listing/${asin}?tag=wasabe-21`;
};

export const createKeepaLink = (asin: string) => {
  return `https://keepa.com/#!product/8-${asin}`;
};
