import { useState, useEffect } from "react";

export default function AdminOrderCard({ order, onAccept, onReject, onStartTimer }) {
    const state = order.order_state;

    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState("");

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

    const totalSeconds =
        Number(hours || 0) * 3600 +
        Number(minutes || 0) * 60 +
        Number(seconds || 0);

    useEffect(() => {
        if (state !== "preparing") return;

        const interval = setInterval(() => {
            const end = new Date(order.timer_endtimestamp).getTime();
            const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
            setRemaining(diff);
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
        }
    }, [eta, state, order.order_id]);

    const formatTime = sec => {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="admin-card">
            <h2 className="admin-title">Order</h2>

            <div className="admin-details">
                <p><strong>Customer name:</strong> {order.full_name}</p>
                <p><strong>Item name:</strong> {order.item_name}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Total:</strong> £{order.total_transaction}</p>
                {deliveryAddress && <p><strong>Delivery address:</strong> {deliveryAddress}</p>}
            </div>

            {state === "pending" && (
                <div className="admin-actions">
                    <button onClick={() => onAccept(order.order_id)}>Accept</button>
                    <button onClick={() => onReject(order.order_id)}>Reject</button>
                </div>
            )}

            {state === "accepted" && (
                <p className="waiting">Waiting for customer to complete payment…</p>
            )}

            {state === "paid" && (
                <>
                    <div className="timer-input">
                        <input type="number" placeholder="Hours" value={hours} onChange={e => setHours(e.target.value)} />
                        <input type="number" placeholder="Minutes" value={minutes} onChange={e => setMinutes(e.target.value)} />
                        <input type="number" placeholder="Seconds" value={seconds} onChange={e => setSeconds(e.target.value)} />

                        <button
                            disabled={totalSeconds <= 0 || totalSeconds > 86400}
                            onClick={() => onStartTimer(order.order_id, totalSeconds)}
                        >
                            Start Timer
                        </button>
                    </div>

                    {totalSeconds > 86400 && <p className="timer-warning">Max allowed time is 24 hours</p>}
                </>
            )}

            {state === "preparing" && (
                <p className="preparing">{formatTime(remaining)}</p>
            )}

            {state === "out_for_delivery" && eta && (
                <div className="admin-eta-box">
                    <p><strong>ETA to customer:</strong> {formatTime(eta.travelSeconds)}</p>
                    <p><strong>Distance:</strong> {(eta.distanceMeters / 1000).toFixed(1)} km</p>
                </div>
            )}

            {state === "completed" && (
                <p className="completed">Order delivered</p>
            )}
        </div>
    );
}
