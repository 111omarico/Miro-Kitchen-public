import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchOrders = createAsyncThunk(
    "orders/fetchOrders",
    async () => {
        const res = await fetch("http://localhost:5000/api/order", {
            credentials: "include"
        });
        const data = await res.json();
        return data.success ? data.orders : [];
    }
);

export const acceptOrder = createAsyncThunk(
    "orders/acceptOrder",
    async (orderId) => {
        const res = await fetch(`http://localhost:5000/api/order/${orderId}/accept`, {
            method: "PUT",
            credentials: "include",
        });
        const data = await res.json();
        return data.success ? orderId : null;
    }
);

export const rejectOrder = createAsyncThunk(
    "orders/rejectOrder",
    async (orderId) => {
        const res = await fetch(`http://localhost:5000/api/order/${orderId}/reject`, {
            method: "PUT",
            credentials: "include",
        });
        const data = await res.json();
        return data.success ? orderId : null;
    }
);
export const startTimer = createAsyncThunk(
    "orders/startTimer",
    async ({ orderId, seconds }) => {
        try {
            const res = await fetch(`http://localhost:5000/api/order/${orderId}/start-timer`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seconds })
            });
            const data = await res.json();
            return data.success ? data.order : null;
        } catch (err) {
            console.error("Start timer failed:", err);
            return null;
        }
    }
);


const ordersSlice = createSlice({
    name: "orders",
    initialState: {
        list: [],
        loading: false,
    },
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchOrders.pending, state => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(acceptOrder.fulfilled, (state, action) => {
                if (!action.payload) return;
                const id = action.payload;
                const index = state.list.findIndex(o => o.order_id === id);
                if (index !== -1) state.list[index].order_state = "accepted";
            })
            .addCase(rejectOrder.fulfilled, (state, action) => {
                if (!action.payload) return;
                const id = action.payload;
                const index = state.list.findIndex(o => o.order_id === id);
                if (index !== -1) state.list[index].order_state = "rejected";
            })

            .addCase(startTimer.fulfilled, (state, action) => {
                if (!action.payload) return;
                const updated = action.payload;
                const index = state.list.findIndex(o => o.order_id === updated.order_id);
                if (index !== -1) state.list[index] = updated;
            });
    }

    
});

export default ordersSlice.reducer;
