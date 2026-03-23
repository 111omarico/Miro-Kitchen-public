import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "./store/userSlice";

import Iteminoffer from "./webpages/offer";

export function MyAppNav() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);

  const [logoutCountdown, setLogoutCountdown] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [showLogoutUI, setShowLogoutUI] = useState(false);

  function handleLogout() {
    setShowLogoutUI(true);

    let timeLeft = 5;
    setLogoutCountdown(timeLeft);

    const timer = setInterval(() => {
      timeLeft -= 1;
      setLogoutCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(timer);
        finalizeLogout();
      }
    }, 1000);

    setLogoutTimer(timer);
  }

  function cancelLogout() {
    clearInterval(logoutTimer);
    setLogoutCountdown(null);
    setShowLogoutUI(false);
  }

  function finalizeLogout() {
    dispatch(logoutUser());
    window.location.href = "/";
  }

  return (
    <>
      <nav className="Headercontainer">
        <div className="Headercontainerleft">
          <img src="/miro-kitchen-logo.png" alt="" className="Miro-kitchen-logo" />

          <NavLink to="/" className="Headerlink" end>
            {/* Home icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11.4697 3.84101C11.7626 3.54811 12.2374 3.54811 12.5303 3.84101L21.2197 12.5303C21.5126 12.8232 21.9874 12.8232 22.2803 12.5303C22.5732 12.2375 22.5732 11.7626 22.2803 11.4697L13.591 2.78035C12.7123 1.90167 11.2877 1.90167 10.409 2.78035L1.71967 11.4697C1.42678 11.7626 1.42678 12.2375 1.71967 12.5303C2.01256 12.8232 2.48744 12.8232 2.78033 12.5303L11.4697 3.84101Z" fill="#FAFBFF" />
              <path d="M12 5.432L20.159 13.591C20.1887 13.6207 20.2191 13.6494 20.25 13.6772V19.875C20.25 20.9105 19.4105 21.75 18.375 21.75H15C14.5858 21.75 14.25 21.4142 14.25 21V16.5C14.25 16.0858 13.9142 15.75 13.5 15.75H10.5C10.0858 15.75 9.75 16.0858 9.75 16.5V21C9.75 21.4142 9.41421 21.75 9 21.75H5.625C4.58947 21.75 3.75 20.9106 3.75 19.875V13.6772C3.78093 13.6494 3.81127 13.6207 3.84099 13.591L12 5.432Z" fill="#FAFBFF" />
            </svg>
          </NavLink>

          <NavLink to="/menu" className="Headerlink" end>Menu</NavLink>

          {user && (
            <NavLink to="/order" className="Headerlink" end>Order</NavLink>
          )}
        </div>

        <div className="Headercontainerright">
          <NavLink to="/about-us" className="Headerlink" end>About us</NavLink>
          <NavLink to="/contact-us" className="Headerlink" end>Contact us</NavLink>

          {!user ? (
            <>
              <NavLink to="/sign-up" className="Headerlink" end>Sign up</NavLink>
              <NavLink to="/login" className="Headerlink" end>Log in</NavLink>
            </>
          ) : (
            <>
              <button onClick={handleLogout} className="Headerlink">Log out</button>

              <NavLink to="/settings" className="Headerlink-setting" end>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8.09332 1.69005C8.18373 1.14759 8.65307 0.75 9.20302 0.75H10.297C10.8469 0.75 11.3163 1.14759 11.4067 1.69005L11.5556 2.58386C11.6264 3.00813 11.9393 3.34838 12.3365 3.51332C12.7339 3.67832 13.1903 3.65629 13.5404 3.40617L14.278 2.87933C14.7255 2.55969 15.3385 2.61042 15.7274 2.99929L16.501 3.77284C16.8898 4.16171 16.9406 4.77472 16.6209 5.22223L16.0939 5.96007C15.8438 6.31012 15.8218 6.76633 15.9867 7.16363C16.1516 7.56078 16.4918 7.87363 16.916 7.94433L17.8099 8.09332C18.3524 8.18373 18.75 8.65307 18.75 9.20302V10.297C18.75 10.8469 18.3524 11.3163 17.8099 11.4067L16.9161 11.5556C16.4919 11.6264 16.1516 11.9393 15.9867 12.3365C15.8217 12.7339 15.8437 13.1903 16.0938 13.5404L16.6206 14.2778C16.9402 14.7253 16.8895 15.3384 16.5006 15.7272L15.7271 16.5008C15.3382 16.8896 14.7252 16.9404 14.2777 16.6207L13.5401 16.0939C13.19 15.8438 12.7337 15.8218 12.3364 15.9867C11.9392 16.1516 11.6264 16.4918 11.5557 16.916L11.4067 17.8099C11.3163 18.3524 10.8469 18.75 10.297 18.75H9.20302C8.65307 18.75 8.18373 18.3524 8.09332 17.8099L7.94435 16.9161C7.87364 16.4919 7.56072 16.1516 7.16349 15.9867C6.76608 15.8217 6.30975 15.8437 5.9596 16.0938L5.22198 16.6207C4.77447 16.9404 4.16146 16.8896 3.77259 16.5007L2.99904 15.7272C2.61017 15.3383 2.55944 14.7253 2.87909 14.2778L3.40612 13.54C3.65616 13.1899 3.67821 12.7337 3.51326 12.3364C3.34837 11.9392 3.00819 11.6264 2.58402 11.5557L1.69005 11.4067C1.14759 11.3163 0.75 10.8469 0.75 10.297V9.20302C0.75 8.65307 1.14759 8.18373 1.69005 8.09332L2.58386 7.94436C3.00813 7.87364 3.34838 7.56071 3.51332 7.16347C3.67833 6.76605 3.65629 6.3097 3.40618 5.95954L2.87948 5.22216C2.55983 4.77465 2.61057 4.16164 2.99943 3.77277L3.77298 2.99922C4.16185 2.61036 4.77486 2.55962 5.22237 2.87927L5.95997 3.40613C6.31004 3.65618 6.76628 3.67822 7.1636 3.51326C7.56077 3.34837 7.87364 3.00819 7.94433 2.584L8.09332 1.69005Z" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M12.7507 9.75002C12.7507 11.4069 11.4076 12.75 9.7507 12.75C8.09384 12.75 6.7507 11.4069 6.7507 9.75002C6.7507 8.09317 8.09384 6.75002 9.7507 6.75002C11.4076 6.75002 12.7507 8.09317 12.7507 9.75002Z" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg></NavLink>
            </>
          )}
        </div>
      </nav>

      {showLogoutUI && (
        <div className="logout-popup">
          <p>Logging out in {logoutCountdown}…</p>
          <button onClick={cancelLogout}>Cancel</button>
        </div>
      )}

      {isHome && (
        <>
          <header><h1>Home</h1></header>
          <Iteminoffer />
        </>
      )}
    </>
  );
}
