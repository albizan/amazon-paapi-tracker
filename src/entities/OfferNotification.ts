import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { AmazonProduct } from "./AmazonProduct";

@Entity()
export class OfferNotification {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => AmazonProduct, (amazonProduct) => amazonProduct.notifications)
  product: AmazonProduct;

  @Column({ nullable: true })
  sellerName: string;

  @Column()
  type: string;

  @Column({ type: "real" })
  price: number;
}
