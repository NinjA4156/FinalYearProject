import Navbar from './Navbar'

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar />
            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
    )
}