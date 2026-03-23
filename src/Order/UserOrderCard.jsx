import { useState, useEffect } from "react";
import estimatedTimeStatusPending from "./estimatedTimeStatusPending";

export default function UserOrderCard({ order, refreshOrders }) {
    if (!order) return null;

    const state = order.order_state;

    const [remaining, setRemaining] = useState(0);
    const [eta, setEta] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/order/${order.order_id}/delivery`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => data.success && setDeliveryAddress(data.delivery_address));
    }, [order.order_id]);

    useEffect(() => {
        if (state !== "preparing") return;

        const interval = setInterval(async () => {
            const end = new Date(order.timer_endtimestamp).getTime();
            const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
            setRemaining(diff);

            if (diff === 0) {
                await fetch(`http://localhost:5000/api/order/${order.order_id}/mark-out-for-delivery`, {
                    method: "PUT",
                    credentials: "include"
                });
                refreshOrders?.();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [state, order.timer_endtimestamp]);

    const fetchEta = async () => {
        const res = await fetch(`http://localhost:5000/api/order/${order.order_id}/eta`, {
            credentials: "include"
        });
        const data = await res.json();
        if (!data.success) return;

        setEta(prev => {
            if (!prev) return data;
            if (data.travelSeconds < prev.travelSeconds) return data;
            return prev;
        });
    };

    useEffect(() => {
        if (state === "out_for_delivery") fetchEta();
    }, [state, order.order_id]);

    useEffect(() => {
        if (state !== "out_for_delivery") return;
        const interval = setInterval(fetchEta, 300000);
        return () => clearInterval(interval);
    }, [state, order.order_id]);

    useEffect(() => {
        if (state !== "out_for_delivery") return;

        const interval = setInterval(() => {
            setEta(prev => prev && ({
                ...prev,
                travelSeconds: Math.max(0, prev.travelSeconds - 1)
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [state]);

    useEffect(() => {
        if (state === "out_for_delivery" && eta?.travelSeconds === 0) {
            fetch(`http://localhost:5000/api/order/${order.order_id}/complete`, {
                method: "PUT",
                credentials: "include"
            });
            refreshOrders?.();
        }
    }, [eta, state, order.order_id]);

    const formatTime = sec => {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const handlePurchase = async () => {
        const res = await fetch("http://localhost:5000/api/purchase/create-checkout-session", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                order_id: order.order_id,
                item_id: order.item_id,
                quantity: Number(order.quantity),
            }),
        });

        const data = await res.json();
        if (data.url) window.location.href = data.url;
    };

    const getStatusLabel = () => ({
        accepted: "Accepted",
        rejected: "Rejected",
        paid: "Paid",
        preparing: "Preparing",
        out_for_delivery: "Out for delivery",
        completed: "Completed"
    }[state] || "Pending");

    const getStatusClass = () => ({
        accepted: "status-accepted",
        rejected: "status-rejected",
        paid: "status-paid",
        preparing: "status-preparing",
        out_for_delivery: "status-delivery",
        completed: "status-completed"
    }[state] || "status-pending");

    return (
        <div className="pending-order-card">
            <h2 className="pending-order-title">Your Order</h2>

            <p className="order-id"><strong>Order ID:</strong> #{order.order_id}</p>

            <div className="pending-order-details">
                <p><strong>Item name:</strong> {order.item_name}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Total cost:</strong> £{order.total_transaction}</p>
                {deliveryAddress && <p><strong>Delivery address:</strong> {deliveryAddress}</p>}
            </div>

            <div className={`order-status ${getStatusClass()}`}>
                <strong>Status:</strong> {getStatusLabel()}
            </div>

            {state === "pending" && (
                <div className="pending-order-message">
                    Wait for the admin response<br />
                    <strong>Estimated processing time:</strong>{" "}
                    {estimatedTimeStatusPending(order.order_timestamp)}
                </div>
            )}

            {state === "rejected" && (
                <div className="rejected-order-message">
                    <h3>Your order has been rejected</h3>
                    <p className="expiration-warning">
                        This order will expire within 30 days and will be removed.
                    </p>
                </div>
            )}

            {state === "accepted" && (
                <>
                    <button className="orderpurchase-button" onClick={handlePurchase}>
                        Complete the payment
                    </button>

                    <div className="accepted-order-message">
                        <h3>Your order has been accepted</h3>
                        <p className="accepted-note">Please proceed with the payment.</p>
                    </div>
                </>
            )}

            {state === "paid" && !order.timer_starttimestamp && (
                <div className="waiting-admin-message">
                    <h3>Payment complete</h3>
                    <p>The admin will now start preparing your order.</p>
                </div>
            )}

            {state === "preparing" && (
                <div className="user-countdown-box">
                    <h3>Your order is being prepared</h3>
                    <p className="user-countdown">{formatTime(remaining)}</p>
                </div>
            )}

            {state === "out_for_delivery" && eta && (
                <div className="user-countdown-box">
                    <h3>Your order is on the way</h3>
                    <p className="user-countdown">{formatTime(eta.travelSeconds)}</p>
                    <p>Estimated arrival time based on live traffic.</p>
                </div>
            )}

            {state === "completed" && (
                <div className="user-countdown-box">
                    <h3>Your order has been delivered</h3>
                </div>
            )}
        </div>
    );
}
