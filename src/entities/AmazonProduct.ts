import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class AmazonProduct {
  @PrimaryColumn()
  asin: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  visitedAt: string;

  @Column({ nullable: true, type: "real" })
  price: number;

  @Column({ nullable: true, type: "real" })
  warehousePrice: number;

  @Column({ default: 0 })
  iterations: number;
}
