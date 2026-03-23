import { NavLink } from "react-router";
function Menu() {

    return (
        <>
            <title>Menu-Miro kitchen </title>
            <header className="subhead-menu">
                <div className="subheader-contain">
                    <h1 className="subheader" >Menu</h1>
                    <h1 className="subheader" > Categories:</h1>
                </div>
            </header>
            <main>

                <ul className="categorylist">

                    <li className="categorybuttons maindishes" >
                        <NavLink to="/maindishes" className="categorybuttons maindishes" >
                            Main dishes
                        </NavLink>
                    </li>

                    <li className="categorybuttons sandwiches" >
                        <NavLink to="/sandwiches" className="categorybuttons sandwiches">Sandwiches</NavLink >

                    </li>



                    <li className="categorybuttons salad"  >
                        <NavLink to="/salad" className="categorybuttons salad" >Salad
                        </NavLink>
                    </li>


                    <li className="categorybuttons pasta" >
                        <NavLink to="/pasta" className="categorybuttons pasta">Pasta
                        </NavLink>
                    </li>


                    <li className="categorybuttons sides" >
                        <NavLink to="/sides" className="categorybuttons sides">Sides
                        </NavLink>
                    </li>

                </ul>


            </main>
        </>
    )
}

export default Menu