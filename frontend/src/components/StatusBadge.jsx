function StatusBadge({ status }) {
    const styles = {
        waiting: "bg-yellow-100 text-yellow-800 border border-yellow-300",
        calling: "bg-blue-100 text-blue-800 border border-blue-300",
        called: "bg-blue-100 text-blue-800 border border-blue-300",
        completed: "bg-green-100 text-green-800 border border-green-300",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${styles[status] || "bg-gray-100 text-gray-800 border border-gray-300"
                }`}
        >
            {status}
        </span>
    );
}

export default StatusBadge;