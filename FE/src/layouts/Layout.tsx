import { Outlet } from "react-router-dom"
import ClientHeader from '../components/client/ClientHeader'
import { ClientFooter } from '../components/client/ClientFooter'
// import { NotificationBell } from '../components/notification/NotificationBell' // TODO: Implement NotificationController in BE
import { ScrollToTopButton } from '../components/client/ScrollToTopButton'
import { FacebookStyleChatWidget } from '../components/client/FacebookStyleChatWidget'

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <ClientHeader />
            <main className="flex-1">
                <Outlet />
            </main>
            <ClientFooter />
            {/* <NotificationBell /> */}
            <ScrollToTopButton />
            <FacebookStyleChatWidget />
        </div>
    )
}