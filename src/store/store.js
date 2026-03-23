import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import ordersReducer from "./ordersSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        orders: ordersReducer,
    },
});
