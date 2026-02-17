import { configureStore } from "@reduxjs/toolkit";
import authAdmin from "./features/adminAuthSlice";
import { api as authApi } from "./services/authApi";
import { inventoryApi } from "./services/inventoryApi";
import { categoryApi } from "./services/categoryApi";
import { adminApi } from "./services/adminApi";
import { paymentMethodApi } from "./services/paymentMethodApi";
import { adminLoginApi } from "./services/adminLoginApi";
import { orderApi } from "./services/orderApi";
import { consultationPlanApi } from "./services/consultationPlanApi";
import { consultationTimeSlotApi } from "./services/consultationTimeSlotApi";
import { bookingApi } from "./services/bookingApi";
import { learnApi } from "./services/learnApi";
import { adApi } from "./services/adApi";
import { cartApi } from "./services/cartApi";
import { returnApi } from "./services/returnApi";
import { notificationApi } from "./services/notificationApi";
import { discountApi } from "./services/discountApi";

export const store = configureStore({
  reducer: {
    adminAuth: authAdmin,
    [authApi.reducerPath]: authApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [paymentMethodApi.reducerPath]: paymentMethodApi.reducer,
    [adminLoginApi.reducerPath]: adminLoginApi.reducer,
    [adApi.reducerPath]: adApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [consultationPlanApi.reducerPath]: consultationPlanApi.reducer,
    [consultationTimeSlotApi.reducerPath]: consultationTimeSlotApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [learnApi.reducerPath]: learnApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [returnApi.reducerPath]: returnApi.reducer,
    [discountApi.reducerPath]: discountApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(adApi.middleware)
      .concat(categoryApi.middleware)
      .concat(paymentMethodApi.middleware)
      .concat(adminLoginApi.middleware)
      .concat(orderApi.middleware)
      .concat(cartApi.middleware)
      .concat(returnApi.middleware)
      .concat(discountApi.middleware)
      .concat(adminApi.middleware)
      .concat(consultationPlanApi.middleware)
      .concat(consultationTimeSlotApi.middleware)
      .concat(bookingApi.middleware)
      .concat(notificationApi.middleware)
      .concat(learnApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
