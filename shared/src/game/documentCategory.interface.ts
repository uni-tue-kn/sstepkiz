import { Item } from "./item.interface";

export interface DocumentCategory {
  id: number,
  name: string;
  image: string;
  items: Item[];
  category: string | number;
}
