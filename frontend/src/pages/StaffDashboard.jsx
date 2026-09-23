import { useEffect, useState } from "react";
import { connectSocket } from "../services/socket";
import { getTokens, callToken, completeToken } from "../services/tokenApi";
import StatusBadge from "../components/StatusBadge";

function StaffDashboard() {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTokens = async () => {
        try {
            const data = await getTokens();
            setTokens(data);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load tokens.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTokens();

        const socket = connectSocket((data) => {
            // whenever backend says something changed, just reload
            loadTokens();
        });

        return () => socket.close();
    }, []);

    const handleCall = async (id) => {
        try {
            await callToken(id);
            loadTokens();
        } catch (err) {
            console.error(err);
            setError("Failed to call token.");
        }
    };

    const handleComplete = async (id) => {
        try {
            await completeToken(id);
            loadTokens();
        } catch (err) {
            console.error(err);
            setError("Failed to complete token.");
        }
    };

    const countByStatus = (status) =>
        tokens.filter((t) => t.status === status).length;

    const formatTime = (timestamp) => {
        if (!timestamp) return "-";
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-10">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Queue Management System
                </h1>
                <p className="text-gray-500">Staff Dashboard</p>
            </header>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow p-5 text-center">
                    <p className="text-gray-500 text-sm">Waiting</p>
                    <p className="text-3xl font-bold text-yellow-600">
                        {countByStatus("waiting")}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-5 text-center">
                    <p className="text-gray-500 text-sm">Called</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {countByStatus("calling")}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow p-5 text-center">
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-green-600">
                        {countByStatus("completed")}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 text-sm">
                        <tr>
                            <th className="px-4 py-3">Token Number</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Created At</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : tokens.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                                    No tokens yet.
                                </td>
                            </tr>
                        ) : (
                            tokens.map((t) => (
                                <tr key={t.id} className="border-t">
                                    <td className="px-4 py-3 font-semibold">{t.token_number}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={t.status} />
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {formatTime(t.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {t.status === "waiting" && (
                                            <button
                                                onClick={() => handleCall(t.id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
                                            >
                                                Call
                                            </button>
                                        )}
                                        {(t.status === "calling" || t.status === "called") && (
                                            <button
                                                onClick={() => handleComplete(t.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg cursor-pointer transition-colors"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {t.status === "completed" && (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StaffDashboard;