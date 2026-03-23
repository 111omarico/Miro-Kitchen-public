import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../store/userSlice";
import { fetchOrders, acceptOrder, rejectOrder, startTimer } from "../store/ordersSlice";

import AdminOrderCard from "../Order/AdminOrderCard";
import UserOrderCard from "../Order/UserOrderCard";

export default function Order() {
    const dispatch = useDispatch();

    const user = useSelector(state => state.user.user);
    const orders = useSelector(state => state.orders.list);

    useEffect(() => {
        dispatch(fetchUser());
        dispatch(fetchOrders());
    }, [dispatch]);

    return (
        <div className="orders-page">
            <h1>{user?.is_admin ? "Orders" : "Track your order"}</h1>

            {orders.length === 0 && <p>No orders found</p>}

            {orders.map(order =>
                user?.is_admin ? (
                    <AdminOrderCard
                        key={order.order_id}
                        order={order}
                        onAccept={() => dispatch(acceptOrder(order.order_id))}
                        onReject={() => dispatch(rejectOrder(order.order_id))}
                        onStartTimer={(id, seconds) => dispatch(startTimer({ orderId: id, seconds }))}
                    />
                ) : (
                    <UserOrderCard
                        key={order.order_id}
                        order={order}
                        refreshOrders={() => dispatch(fetchOrders())}
                    />
                )
            )}
        </div>
    );
}
