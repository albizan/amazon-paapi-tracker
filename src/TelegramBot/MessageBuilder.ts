import { AmazonProduct } from "../entities/AmazonProduct";

export const defaultMessage = (savedItem: AmazonProduct, price: number, oldPrice: number, condition: string, diff: number = 0) => {
  return `<b>${savedItem.title}</b>\nCondizione: ${condition}\nPrezzo: ${oldPrice} => ${price}\n${diff ? `<b>Sconto: ${diff}</b>` : ""}`;
};
