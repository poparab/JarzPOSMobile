import cartReducer, {
  addItem,
  updateQty,
  removeItem,
  clearCart,
} from '../src/store/cartSlice';

describe('cartSlice reducer', () => {
  it('should handle addItem for new item', () => {
    const initial = undefined;
    const state = cartReducer(
      initial as any,
      addItem({ id: '1', name: 'A', price: 10, qty: 2 } as any),
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toMatchObject({ id: '1', qty: 2 });
  });

  it('should increment qty when same id added', () => {
    const state = cartReducer(
      { items: [{ id: '1', name: 'A', price: 10, qty: 1 }] },
      addItem({ id: '1', name: 'A', price: 10, qty: 3 } as any),
    );
    expect(state.items[0].qty).toBe(4);
  });

  it('should update quantity', () => {
    const state = cartReducer(
      { items: [{ id: '1', name: 'A', price: 10, qty: 2 }] },
      updateQty({ id: '1', qty: 5 }),
    );
    expect(state.items[0].qty).toBe(5);
  });

  it('should remove item', () => {
    const state = cartReducer(
      { items: [{ id: '1', name: 'A', price: 10, qty: 2 }] },
      removeItem('1'),
    );
    expect(state.items).toHaveLength(0);
  });

  it('should clear cart', () => {
    const state = cartReducer(
      { items: [{ id: '1', name: 'A', price: 10, qty: 2 }] },
      clearCart(),
    );
    expect(state.items).toHaveLength(0);
  });
});
