import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
    return (
        <div className="py-4 px-1 flex flex-col min-h-screen max-w-screen-2xl m-auto border">
            <Header />
            <Outlet />
        </div>
    )
}