import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReviewSection from "./ReviewSection";

function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const paddedId = id.toString().padStart(12, "0");

    fetch(`http://localhost:5000/api/items/${paddedId}`)
      .then((res) => res.json())
      .then((data) => setItem(data));
  }, [id]);

  useEffect(() => {
    fetch("http://localhost:5000/api/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      });
  }, []);

  async function handlePurchase() {
    setShowConfirm(false);

    const paddedId = id.toString().padStart(12, "0");

    const response = await fetch("http://localhost:5000/api/itemform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        itemId: paddedId,
        quantity,
      }),
    });

    const data = await response.json();

    if (data.success) {
      navigate("/order");
    } else {
      console.log("Error: " + data.error);
    }
  }

  if (!item) return <p>Loading...</p>;

  const finalPrice = (item.item_price * (1 - item.discount)).toFixed(2);

  return (
    <div>
      <header>
        <h1 className="itemname">{item.item_name}</h1>
      </header>

      <div className="itemcontainerpage">
        <div className="item">
          <div className="item-left">
            <img src={item.image} alt={item.item_name} className="itemimage" />
          </div>

          <div className="item-right">
            <div className="allergenscontainer">
              <p className="Allergens">
                Contains: <b>{item.allergen_description}</b>
              </p>
            </div>

            {user && (
              <>
                {user.is_admin ? (
                  <div className="admin-edit-container">
                    <button
                      className="edit-item-button"
                      onClick={() => navigate(`/edit-item/${item.item_id}`)}
                    >
                      Edit This Item
                    </button>
                  </div>
                ) : (
                  <div className="purchase-form">
                    <p className="itemprice">Price: £{finalPrice}</p>

                      <div className="quantity-selector">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="qty-btn minus"
                        >

                          <svg width="30" height="29" viewBox="0 0 30 29" xmlns="http://www.w3.org/2000/svg">
                            <path className="qty-icon" fillRule="evenodd" clipRule="evenodd" d="M14.625 0C6.54784 0 0 6.36595 0 14.2188C0 22.0715 6.54784 28.4375 14.625 28.4375C22.7022 28.4375 29.25 22.0715 29.25 14.2188C29.25 6.36595 22.7022 0 14.625 0ZM19.125 15.3125C19.7463 15.3125 20.25 14.8228 20.25 14.2188C20.25 13.6147 19.7463 13.125 19.125 13.125H10.125C9.50368 13.125 9 13.6147 9 14.2188C9 14.8228 9.50368 15.3125 10.125 15.3125H19.125Z" />
                          </svg>
                        </button>

                        <span>quantity: {quantity}</span>

                        <button
                          onClick={() => setQuantity(q => Math.min(item.restriction, q + 1))}
                          className="qty-btn plus"
                        >

                          <svg width="30" height="29" viewBox="0 0 30 29" xmlns="http://www.w3.org/2000/svg">
                            <path className="qty-icon" fillRule="evenodd" clipRule="evenodd" d="M14.625 0C6.54784 0 0 6.36595 0 14.2188C0 22.0715 6.54784 28.4375 14.625 28.4375C22.7022 28.4375 29.25 22.0715 29.25 14.2188C29.25 6.36595 22.7022 0 14.625 0ZM15.75 9.84375C15.75 9.23969 15.2463 8.75 14.625 8.75C14.0037 8.75 13.5 9.23969 13.5 9.84375V13.125H10.125C9.50368 13.125 9 13.6147 9 14.2188C9 14.8228 9.50368 15.3125 10.125 15.3125H13.5V18.5938C13.5 19.1978 14.0037 19.6875 14.625 19.6875C15.2463 19.6875 15.75 19.1978 15.75 18.5938V15.3125H19.125C19.7463 15.3125 20.25 14.8228 20.25 14.2188C20.25 13.6147 19.7463 13.125 19.125 13.125H15.75V9.84375Z" />
                          </svg>
                        </button>
                      </div>

                    {quantity === item.restriction && (
                      <p className="limit-warning">
                        Maximum allowed quantity is {item.restriction}
                      </p>
                    )}

                    <button
                      className="purchase-button"
                      onClick={() => setShowConfirm(true)}
                      disabled={quantity > item.restriction}
                    >
                      Purchase
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="containeritemdescription">
          <p className="itemdescription">{item.item_description}</p>
        </div>

        <div className="commentsection">


          

          <ReviewSection itemId={item.item_id} user={user} />
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h2>Confirm Purchase</h2>
            <p className="confirm-text">
              You are about to purchase <strong>{quantity}</strong> x{" "}
              <strong>{item.item_name}</strong> for{" "}
              <strong>£{finalPrice}</strong> each.
            </p>

            <p className="confirm-total">
              Total: <strong>£{(quantity * finalPrice).toFixed(2)}</strong>
            </p>

            <div className="confirm-buttons">
              <button className="confirm-yes" onClick={handlePurchase}>
                Yes, Purchase
              </button>
              <button
                className="confirm-no"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemPage;
