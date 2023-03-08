export interface Item { id: number, name: string }

export type Items = Array<Item> | [];

export interface Board {
  id: number,
  name: string,
  items: Items,
}

export interface InitialState {
  boards: Array<Board>;
}