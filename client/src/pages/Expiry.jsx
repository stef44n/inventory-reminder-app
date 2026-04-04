import { useEffect, useState } from "react";
import API from "../api/api";

export default function Expiry() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [notifyDaysBefore, setNotifyDaysBefore] = useState("");

    const fetchItems = async () => {
        try {
            const res = await API.get("/expiry");
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();

        try {
            await API.post("/expiry", {
                name,
                category: "EXPIRY",
                expiryDate,
                notifyDaysBefore: Number(notifyDaysBefore),
            });

            setName("");
            setExpiryDate("");
            setNotifyDaysBefore("");

            fetchItems();
        } catch (err) {
            console.error(err);
            alert("Error adding item");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/expiry/${id}`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Expiry Items</h2>

            {/* Add Form */}
            <form onSubmit={handleAdd}>
                <input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br />
                <br />

                <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                />
                <br />
                <br />

                <input
                    type="number"
                    placeholder="Notify X days before"
                    value={notifyDaysBefore}
                    onChange={(e) => setNotifyDaysBefore(e.target.value)}
                />
                <br />
                <br />

                <button type="submit">Add</button>
            </form>

            <hr />

            {/* List */}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <strong>{item.name}</strong> —
                        {new Date(item.expiry.expiryDate).toLocaleDateString()}
                        (Notify {item.expiry.notifyDaysBefore} days before)
                        <button onClick={() => handleDelete(item.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
