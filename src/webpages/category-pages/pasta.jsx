import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Pasta() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/items")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (item) => item.category.toLowerCase() === "pasta"
        );
        setItems(filtered);
      });
  }, []);

  return (
    <div>
      <h1>Pasta</h1>

      <div className="itemcat">
      {items.length === 0 && <p>No items found.</p>}

      {items.map((item) => {
      
        const paddedId = item.item_id.toString().padStart(12, "0");
        
        return (
          <div key={paddedId} className="itemcategory">
            <Link to={`/item/${paddedId}`} >
            <img src={item.image} alt={item.item_name} className="itemcategoryimage"/>

             <div className="itemnamecategory">{item.item_name} </div> 
      
            </Link>
          </div>
        );
      })}
    </div>
    </div>
  );
}

export default Pasta;


