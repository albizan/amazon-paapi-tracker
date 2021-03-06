import { AmazonProduct } from "../entities/AmazonProduct";

export const defaultMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0) => {
  return `<a href="${savedItem.url}">${savedItem.title}</a>\nCondizione: ${condition}\nPrezzo: ${oldPrice} => ${price}\n${
    diff ? `<b>Sconto: ${diff.toFixed(2)}</b>` : ""
  }`;
};
