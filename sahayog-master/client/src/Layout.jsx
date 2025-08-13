import Header from "./Header.jsx"
import {Outlet} from "react-router-dom";

export default function Layout() {
  return ( 
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header/>  
      <Outlet />
    </div>
  );
}