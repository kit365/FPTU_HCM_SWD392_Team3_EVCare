import { Outlet } from "react-router-dom"

export const LayoutAdmin = () => {
    return (
        <>
            <div>Header Admin</div>

            <Outlet />

            <div>Footer Admin</div>
        </>
    )
}