import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchUser } from "./store/userSlice";

import { MyAppNav } from "./Navlink.jsx";
import Aboutus from "./webpages/about-us.jsx";
import Contactus from "./webpages/contact-us.jsx";
import Menu from "./webpages/menu.jsx";
import Salad from "./webpages/category-pages/salad.jsx";
import Maindishes from "./webpages/category-pages/main-dishes.jsx";
import Pasta from "./webpages/category-pages/pasta.jsx";
import Sides from "./webpages/category-pages/sides.jsx";
import Sandwiches from "./webpages/category-pages/sandwiches.jsx";
import Signup from "./webpages/sign-up.jsx";
import Login from "./webpages/login.jsx";
import ItemPage from "./webpages/itempage.jsx";
import Order from "./webpages/order.jsx";
import Setting from "./webpages/setting.jsx";
import EditItemPage from "./webpages/edit-item-page.jsx";
import AdminReviewTracker from "./webpages/AdminReviewTracker.jsx";
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <>
      <Router>
        <MyAppNav />

        <Routes>
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/edit-item/:id" element={<EditItemPage />} />
          <Route path="/admin/reviews" element={<AdminReviewTracker />} />
          <Route path="/about-us" element={<Aboutus />} />
          <Route path="/contact-us" element={<Contactus />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/sides" element={<Sides />} />
          <Route path="/pasta" element={<Pasta />} />
          <Route path="/salad" element={<Salad />} />
          <Route path="/maindishes" element={<Maindishes />} />
          <Route path="/sandwiches" element={<Sandwiches />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order" element={<Order />} />
          <Route path="/settings" element={<Setting />} />
        </Routes>
      </Router>

      <footer>Miro Kitchen</footer>
    </>
  );
}

export default App;
