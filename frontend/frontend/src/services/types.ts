export interface ShoppingList {
    id: number;
    family: {
      id: number;
      name: string;
    };
    family_id: number;
    name: string;
    created_by: {
      id: number;
      username: string;
      full_name: string;
    };
    created_at: string;
    updated_at: string;
  }
  
  export interface ShoppingItem {
    id: number;
    shopping_list: ShoppingList;
    shopping_list_id: number;
    item: string;
    quantity: number;
    created_at: string;
    updated_at: string;
  } 