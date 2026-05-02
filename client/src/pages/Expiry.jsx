import { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";
import Card from "../components/Card";

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
        <div className="container">
            <Header title="Expiry Items" />

            {/* Add Form */}
            <form onSubmit={handleAdd}>
                <div className="card">
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

                    <button type="submit" className="button-primary">
                        Add
                    </button>
                </div>
            </form>

            <hr className="divider" />

            {/* List */}

            {items.length === 0 ? (
                <p className="empty-text">No items yet</p>
            ) : (
                items.map((item) => {
                    const expiryDate = new Date(item.expiry.expiryDate);
                    const now = new Date();

                    const diffTime = expiryDate - now;
                    const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                    );

                    let statusText = "OK";
                    let statusClass = "status-ok";

                    if (diffDays < 0) {
                        statusText = "Expired";
                        statusClass = "status-expired";
                    } else if (diffDays <= item.expiry.notifyDaysBefore) {
                        statusText = "Soon";
                        statusClass = "status-soon";
                    }

                    return (
                        <Card key={item.id}>
                            <div className="card-row">
                                {/* LEFT */}
                                <div className="card-left">
                                    <span className="card-title">
                                        {item.name}
                                    </span>

                                    <span className="card-subtext">
                                        Expires:{" "}
                                        {expiryDate.toLocaleDateString()}
                                    </span>

                                    <span className="card-subtext">
                                        {diffDays >= 0
                                            ? `${diffDays} day${
                                                  diffDays !== 1 ? "s" : ""
                                              } left`
                                            : `${Math.abs(diffDays)} day${
                                                  Math.abs(diffDays) !== 1
                                                      ? "s"
                                                      : ""
                                              } overdue`}
                                    </span>
                                </div>

                                {/* RIGHT */}
                                <div className="card-right">
                                    {/* STATUS */}
                                    <div className={`status ${statusClass}`}>
                                        {statusText}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="card-actions">
                                        <button
                                            className="button-small"
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    );
}
