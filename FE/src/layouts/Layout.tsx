import { Outlet } from "react-router-dom"
import ClientHeader from '../components/client/ClientHeader'
<<<<<<< HEAD
import { ClientFooter } from "../components/client/ClientFooter"
import { ScrollToTopButton } from "../components/client/ScrollToTopButton"
=======
import { ClientFooter } from '../components/client/ClientFooter'
import { SimpleChatWidget } from '../components/message/SimpleChatWidget'
>>>>>>> 3c7df0dcfe34bae8dc331810a75904ab184b38d6

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <ClientHeader />
            <main className="flex-1">
                <Outlet />
            </main>
            <ClientFooter />
<<<<<<< HEAD
            <ScrollToTopButton />
=======
            <SimpleChatWidget />
>>>>>>> 3c7df0dcfe34bae8dc331810a75904ab184b38d6
        </div>
    )
}