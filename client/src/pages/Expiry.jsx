import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";
import Card from "../components/Card";
import SwipeCard from "../components/SwipeCard";
import SkeletonCard from "../components/SkeletonCard";
import ItemToolbar from "../components/ItemToolbar";
import toast from "react-hot-toast";

export default function Expiry() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [notifyDaysBefore, setNotifyDaysBefore] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const nameInputRef = useRef(null);

    const fetchItems = async () => {
        try {
            setLoading(true);

            const res = await API.get("/expiry");

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

        window.addEventListener("openAddExpiry", openForm);

        return () => {
            window.removeEventListener("openAddExpiry", openForm);
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
            await API.post("/expiry", {
                name,
                category: "EXPIRY",
                expiryDate,
                notifyDaysBefore: Number(notifyDaysBefore),
            });

            setName("");
            setExpiryDate("");
            setNotifyDaysBefore("");
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
            await API.delete(`/expiry/${id}`);
            fetchItems();
            toast.success("Item deleted");
        } catch (err) {
            console.error(err);
        }
    };

    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const expiryDate = new Date(item.expiry.expiryDate);
            const today = new Date();

            const diffDays = Math.ceil(
                (expiryDate - today) / (1000 * 60 * 60 * 24),
            );

            const expired = diffDays < 0;
            const soon = diffDays <= 7;

            if (activeFilter === "Expired") {
                return matchesSearch && expired;
            }

            if (activeFilter === "Soon") {
                return matchesSearch && soon && !expired;
            }

            if (activeFilter === "OK") {
                return matchesSearch && diffDays > 7;
            }

            return matchesSearch;
        })
        .sort((a, b) => {
            return (
                new Date(a.expiry.expiryDate) - new Date(b.expiry.expiryDate)
            );
        });

    return (
        <div className="container">
            <Header title="Expiry Items" />

            <ItemToolbar
                search={search}
                setSearch={setSearch}
                filters={["All", "Expired", "Soon", "OK"]}
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
                                    className="date-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Expiry Date
                                </label>

                                <input
                                    className="date-input"
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) =>
                                        setExpiryDate(e.target.value)
                                    }
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Notify X days before
                                </label>

                                <input
                                    type="number"
                                    className="date-input"
                                    value={notifyDaysBefore}
                                    onChange={(e) =>
                                        setNotifyDaysBefore(e.target.value)
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
                <p className="empty-text">No items yet</p>
            ) : (
                filteredItems.map((item) => {
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
                        <SwipeCard
                            key={item.id}
                            isActive={activeSwipeId === item.id}
                            onActivate={() => setActiveSwipeId(item.id)}
                            onCloseOther={() => setActiveSwipeId(null)}
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
                            <Card icon="⏳">
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
                                        <div
                                            className={`status ${statusClass}`}
                                        >
                                            {statusText}
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
