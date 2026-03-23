import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// FETCH USER
export const fetchUser = createAsyncThunk(
    "user/fetchUser",
    async () => {
        const res = await fetch("http://localhost:5000/api/me", {
            credentials: "include",
        });
        const data = await res.json();
        return data.success ? data.user : null;
    }
);

// LOGOUT USER
export const logoutUser = createAsyncThunk(
    "user/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();
            if (!data.success) return rejectWithValue(data.error);

            return true;
        } catch {
            return rejectWithValue("Logout failed");
        }
    }
);

// UPDATE PASSWORD
export const updatePassword = createAsyncThunk(
    "user/updatePassword",
    async (password, { rejectWithValue }) => {
        try {
            const res = await fetch("http://localhost:5000/api/settings/password", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();
            if (!data.success) return rejectWithValue(data.error);
            return data.message || "Password updated";
        } catch {
            return rejectWithValue("Server error while updating password");
        }
    }
);

// DELETE ACCOUNT
export const deleteAccount = createAsyncThunk(
    "user/deleteAccount",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch("http://localhost:5000/api/settings/account", {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();
            if (!data.success) return rejectWithValue(data.error);
            return true;
        } catch {
            return rejectWithValue("Server error while deleting account");
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState: {
        user: null,
        loading: false,
        error: null,
        passwordStatus: null,
        passwordError: null,
        deleteError: null,
        deleteSuccess: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // FETCH USER
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
            })

            // LOGOUT USER
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.error = action.payload;
            })

            // UPDATE PASSWORD
            .addCase(updatePassword.pending, (state) => {
                state.loading = true;
                state.passwordStatus = null;
                state.passwordError = null;
            })
            .addCase(updatePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.passwordStatus = action.payload;
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false;
                state.passwordError = action.payload;
            })

            // DELETE ACCOUNT
            .addCase(deleteAccount.pending, (state) => {
                state.loading = true;
                state.deleteError = null;
                state.deleteSuccess = false;
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.loading = false;
                state.deleteSuccess = true;
                state.user = null;
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.loading = false;
                state.deleteError = action.payload;
            });
    },
});

export default userSlice.reducer;
