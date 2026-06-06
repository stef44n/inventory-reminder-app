import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import Card from "../components/Card";
import Header from "../components/Header";
import SwipeCard from "../components/SwipeCard";
import SkeletonCard from "../components/SkeletonCard";
import ItemToolbar from "../components/ItemToolbar";
import { isSubscriptionDue } from "../utils/itemStatus";
import { undoDelete } from "../utils/undoDelete";
import toast from "react-hot-toast";

export default function Subscriptions() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [cycleDays, setCycleDays] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const nameInputRef = useRef(null);

    const fetchItems = async () => {
        try {
            setLoading(true);

            const res = await API.get("/subscriptions");

            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        if (showForm && nameInputRef.current) {
            setTimeout(() => {
                nameInputRef.current.focus();
                nameInputRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [showForm]);

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

    const handleDelete = async (item) => {
        await undoDelete({
            item,
            endpoint: "/subscriptions",
            setItems,

            buildRestorePayload: (item) => ({
                name: item.name,
                category: "SUBSCRIPTION",
                cycleDays: item.subscription.cycleDays,
            }),
        });
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

    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const isDue = isSubscriptionDue(item);

            if (activeFilter === "Due") {
                return matchesSearch && isDue;
            }

            if (activeFilter === "OK") {
                return matchesSearch && !isDue;
            }

            return matchesSearch;
        })
        .sort((a, b) => {
            const aDue = isSubscriptionDue(a);
            const bDue = isSubscriptionDue(b);

            if (aDue !== bDue) {
                return aDue ? -1 : 1;
            }

            return a.name.localeCompare(b.name);
        });

    return (
        <div className="container">
            <Header title="Subscriptions" />

            <ItemToolbar
                search={search}
                setSearch={setSearch}
                filters={["All", "Due", "OK"]}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                addLabel={showForm ? "✕ Cancel" : "+ Add New Item"}
                onAddClick={() => setShowForm(!showForm)}
            />

            {showForm && (
                <div className="form-wrapper">
                    <form onSubmit={handleAdd}>
                        <div className="card">
                            <div className="input-group">
                                <label className="input-label">Item name</label>

                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    className="date-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Cycle (days)
                                </label>

                                <input
                                    type="number"
                                    className="date-input"
                                    value={cycleDays}
                                    onChange={(e) =>
                                        setCycleDays(e.target.value)
                                    }
                                />
                            </div>

                            <button type="submit" className="button-primary">
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <hr className="divider" />

            {/* List */}

            {loading ? (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : items.length === 0 ? (
                <p className="empty-text">No subscriptions yet</p>
            ) : (
                <>
                    {filteredItems.map((item) => (
                        <div key={item.id}>
                            <SwipeCard
                                isActive={activeSwipeId === item.id}
                                onActivate={() => setActiveSwipeId(item.id)}
                                onCloseOther={() => setActiveSwipeId(null)}
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
                                            handleDelete(item);
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
                                        const nextRenewal = new Date(
                                            lastRenewed,
                                        );
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
                                                        {
                                                            item.subscription
                                                                .cycleDays
                                                        }{" "}
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
                                                                  Math.abs(
                                                                      diffDays,
                                                                  ) !== 1
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
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
