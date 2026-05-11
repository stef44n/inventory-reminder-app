import { useEffect, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";
import Card from "../components/Card";
import SwipeCard from "../components/SwipeCard";
import toast from "react-hot-toast";

export default function Chargeables() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [chargeCycleDays, setChargeCycleDays] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchItems = async () => {
        try {
            const res = await API.get("/chargeables");
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();

        const openForm = () => setShowForm(true);

        window.addEventListener("openAddChargeable", openForm);

        return () => {
            window.removeEventListener("openAddChargeable", openForm);
        };
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();

        try {
            await API.post("/chargeables", {
                name,
                category: "CHARGEABLE",
                chargeCycleDays: Number(chargeCycleDays),
            });

            setName("");
            setChargeCycleDays("");
            setShowForm(false);

            fetchItems();
            toast.success("Item added");
        } catch (err) {
            console.error(err);
            toast.error("Error adding item");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/chargeables/${id}`);
            fetchItems();
            toast.success("Item deleted");
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkCharged = async (id) => {
        try {
            await API.put(`/chargeables/${id}/charge`);
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <Header title="Chargeables" />

            {/* Add Form */}
            <button
                className="add-item-button"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? "✕ Cancel" : "+ Add New Item"}
            </button>

            {showForm && (
                <div className="form-wrapper">
                    <form onSubmit={handleAdd}>
                        <div className="card">
                            <input
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Charge cycle (days)"
                                value={chargeCycleDays}
                                onChange={(e) =>
                                    setChargeCycleDays(e.target.value)
                                }
                            />

                            <button type="submit" className="button-primary">
                                Save Item
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <hr className="divider" />

            {/* List */}

            {items.length === 0 ? (
                <p className="empty-text">No items yet</p>
            ) : (
                items.map((item) => {
                    const lastCharged = new Date(item.chargeable.lastChargedAt);
                    const nextCharge = new Date(lastCharged);
                    nextCharge.setDate(
                        nextCharge.getDate() + item.chargeable.chargeCycleDays,
                    );

                    const now = new Date();
                    const isDue = now >= nextCharge;

                    return (
                        <SwipeCard
                            key={item.id}
                            leftAction={(close) => (
                                <button
                                    type="button"
                                    className="swipe-btn"
                                    onClick={() => {
                                        handleMarkCharged(item.id);
                                        close();
                                    }}
                                >
                                    Charged
                                </button>
                            )}
                            rightAction={(close) => (
                                <button
                                    type="button"
                                    className="swipe-btn"
                                    onClick={() => {
                                        handleDelete(item.id);
                                        close();
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        >
                            <Card icon="🔋">
                                <div className="card-row">
                                    {/* LEFT */}
                                    <div className="card-left">
                                        <span className="card-title">
                                            {item.name}
                                        </span>
                                        <span className="card-subtext">
                                            Every{" "}
                                            {item.chargeable.chargeCycleDays}{" "}
                                            days
                                        </span>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="card-right">
                                        {/* STATUS */}
                                        <div
                                            className={`status ${
                                                isDue
                                                    ? "status-due"
                                                    : "status-ok"
                                            }`}
                                        >
                                            {isDue ? "Due" : "OK"}
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="card-actions"></div>
                                    </div>
                                </div>
                            </Card>
                        </SwipeCard>
                    );
                })
            )}
        </div>
    );
}
