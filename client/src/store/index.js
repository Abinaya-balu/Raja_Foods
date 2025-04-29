import shopWishlistReducer from "./shop/wishlist-slice";

const store = configureStore({
  reducer: {
    shopWishlist: shopWishlistReducer,
  },
}); 