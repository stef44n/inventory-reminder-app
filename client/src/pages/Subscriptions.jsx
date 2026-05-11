import { useEffect, useState } from "react";
import API from "../api/api";
import Card from "../components/Card";
import Header from "../components/Header";
import SwipeCard from "../components/SwipeCard";
import toast from "react-hot-toast";

export default function Subscriptions() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState("");
    const [cycleDays, setCycleDays] = useState("");
    const [showForm, setShowForm] = useState(false);

    const fetchItems = async () => {
        try {
            const res = await API.get("/subscriptions");
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();

        const openForm = () => setShowForm(true);

        window.addEventListener("openAddSubscription", openForm);

        return () => {
            window.removeEventListener("openAddSubscription", openForm);
        };
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();

        try {
            await API.post("/subscriptions", {
                name,
                category: "SUBSCRIPTION",
                cycleDays: Number(cycleDays),
            });

            setName("");
            setCycleDays("");
            setShowForm(false);

            fetchItems();
            toast.success("Item added");
        } catch (err) {
            console.error(err);
            toast.error("Error adding subscription");
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/subscriptions/${id}`);
            fetchItems();
            toast.success("Item deleted");
        } catch (err) {
            console.error(err);
        }
    };

    const handleRenew = async (id) => {
        try {
            await API.put(`/subscriptions/${id}/renew`);
            fetchItems();
            toast.success("Subscription renewed");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <Header title="Subscriptions" />

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
                            <br />
                            <br />

                            <input
                                type="number"
                                placeholder="Cycle (days)"
                                value={cycleDays}
                                onChange={(e) => setCycleDays(e.target.value)}
                            />
                            <br />
                            <br />

                            <button type="submit" className="button-primary">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <hr className="divider" />

            {/* List */}

            {items.length === 0 ? (
                <p className="empty-text">No subscriptions yet</p>
            ) : (
                items.map((item) => (
                    <SwipeCard
                        key={item.id}
                        leftAction={(close) => (
                            <button
                                type="button"
                                className="swipe-btn"
                                onClick={() => {
                                    handleRenew(item.id);
                                    close();
                                }}
                            >
                                Renew
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
                        <Card icon="💳">
                            {(() => {
                                const lastRenewed = new Date(
                                    item.subscription.lastRenewedAt,
                                );
                                const nextRenewal = new Date(lastRenewed);
                                nextRenewal.setDate(
                                    nextRenewal.getDate() +
                                        item.subscription.cycleDays,
                                );

                                const now = new Date();
                                const diffTime = nextRenewal - now;
                                const diffDays = Math.ceil(
                                    diffTime / (1000 * 60 * 60 * 24),
                                );

                                let statusText = "OK";
                                let statusClass = "status-ok";

                                if (diffDays < 0) {
                                    statusText = "Due";
                                    statusClass = "status-due";
                                } else if (diffDays <= 2) {
                                    statusText = "Soon";
                                    statusClass = "status-soon";
                                }

                                return (
                                    <div className="card-row">
                                        {/* LEFT */}
                                        <div className="card-left">
                                            <span className="card-title">
                                                {item.name}
                                            </span>

                                            <span className="card-subtext">
                                                Every{" "}
                                                {item.subscription.cycleDays}{" "}
                                                days
                                            </span>

                                            <span className="card-subtext">
                                                {diffDays >= 0
                                                    ? `${diffDays} day${
                                                          diffDays !== 1
                                                              ? "s"
                                                              : ""
                                                      } until renewal`
                                                    : `${Math.abs(
                                                          diffDays,
                                                      )} day${
                                                          Math.abs(diffDays) !==
                                                          1
                                                              ? "s"
                                                              : ""
                                                      } overdue`}
                                            </span>
                                        </div>

                                        {/* RIGHT */}
                                        <div className="card-right">
                                            {/* STATUS */}
                                            <div
                                                className={`status ${statusClass}`}
                                            >
                                                {statusText}
                                            </div>

                                            {/* ACTIONS */}
                                            <div className="card-actions"></div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </Card>
                    </SwipeCard>
                ))
            )}
        </div>
    );
}
