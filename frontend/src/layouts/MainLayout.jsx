import { Outlet } from "react-router-dom";

import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

export default function MainLayout() {

    return (

        <>
            <Header />

            <main className="min-h-screen bg-gray-50">

                <Outlet />

            </main>

            <Footer />
        </>

    );

}