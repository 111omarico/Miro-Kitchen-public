import { Contactusbutton } from "../interactiveelemets/Contactusbutton";
function Contactus() {

    return(
        <>
        <title>Contact us-Miro kitchen </title>
        <header>
        <h1 className="subheader" >Contact us</h1>
        </header>
        <main>
        <p className="paragraphtext0">You can state any suggestions or a complaint directly to the owner </p>
        <div className="containercontactus">
        <p className="paragraphtext1"> Here is how you can contact us: </p>
            <Contactusbutton></Contactusbutton>
        </div>
        </main>
        
        </>
        /*This is the contact page and information about it*/
    );


}
/*Below the component Contactus is exported to App.js */
/*To test the website run: npm run dev*/
export default Contactus