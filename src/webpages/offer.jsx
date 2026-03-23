import { useEffect, useState } from "react";

function ItemsOnOffer() {
  const [items, setItems] = useState([]);

  const fetchItems = () => {
    fetch("http://localhost:5000/api/items")
      .then((res) => res.json())
      .then((data) => {
        const itemsOnOffer = data.filter(
          (item) => parseFloat(item.discount) > 0
        );
        setItems(itemsOnOffer);
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchItems(); // initial load

    //  Create SSE connection
    const events = new EventSource("http://localhost:5000/api/items/stream");

    //  Handle incoming messages
    events.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.op === "POLL_UPDATE") {
        const updated = payload.rows.filter(
          (item) => parseFloat(item.discount) > 0
        );
        setItems(updated);
        return;
      }

      const { op, row } = payload;
      const isDiscounted = parseFloat(row.discount) > 0;

      setItems((prev) => {
        if (op === "DELETE" || !isDiscounted) {
          return prev.filter((i) => i.item_id !== row.item_id);
        }

        const exists = prev.some((i) => i.item_id === row.item_id);

        if (exists) {
          return prev.map((i) => (i.item_id === row.item_id ? row : i));
        }

        return [...prev, row];
      });
    };

    //  Cleanup on unmount
    return () => {
      events.close();
    };
  }, []);

  return (
    <div>
      <h2>Current Food Items On Offer!</h2>
      <ul className="homeoffer">
        {items.map((item) => {
          const originalPrice = parseFloat(item.item_price);
          const discountedPrice = (
            originalPrice * (1 - parseFloat(item.discount))
          ).toFixed(2);

          return (
            <li key={item.item_id} className="Homeitemonoffer">
              <strong className="Homeitemondirectoffer">
                Head to {item.item_name} page in Category: {item.category}
              </strong>
              <span className="Homeitemisondiscount">
                Buy now for a {Math.round(item.discount * 100)}% discount off the original item price
              </span>
              <img src={item.image} alt={item.item_name} className="itemimage" />
              <div className="Homeitemimage"></div>
              <p className="Homeitemhasaprice">
                Was <s>£{originalPrice}</s> → Now <strong>£{discountedPrice}</strong>
              </p>
              <p className="Homeitemdescription">{item.item_description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ItemsOnOffer;
