import { Outlet } from "react-router-dom"
import ClientHeader from '../components/client/ClientHeader'
import { ClientFooter } from "../components/client/ClientFooter"
import { ScrollToTopButton } from "../components/client/ScrollToTopButton"

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <ClientHeader />
            <main className="flex-1">
                <Outlet />
            </main>
            <ClientFooter />
            <ScrollToTopButton />
        </div>
    )
}