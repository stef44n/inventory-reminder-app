import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";
import Card from "../components/Card";
import SwipeCard from "../components/SwipeCard";
import SkeletonCard from "../components/SkeletonCard";
import ItemToolbar from "../components/ItemToolbar";
import { getExpiryStatus } from "../utils/itemStatus";
import { undoDelete } from "../utils/undoDelete";
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

    const handleDelete = async (item) => {
        await undoDelete({
            item,
            endpoint: "/expiry",
            setItems,

            buildRestorePayload: (item) => ({
                name: item.name,
                category: "EXPIRY",
                expiryDate: item.expiry.expiryDate,
                notifyDaysBefore: item.expiry.notifyDaysBefore,
            }),
        });
    };

    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const status = getExpiryStatus(item);

            if (activeFilter === "Expired") {
                return matchesSearch && status === "expired";
            }

            if (activeFilter === "Soon") {
                return matchesSearch && status === "soon";
            }

            if (activeFilter === "OK") {
                return matchesSearch && status === "ok";
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
                <>
                    {filteredItems.map((item) => {
                        const expiryDate = new Date(item.expiry.expiryDate);

                        const now = new Date();

                        const diffTime = expiryDate - now;

                        const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24),
                        );

                        const status = getExpiryStatus(item);

                        let statusText = "OK";
                        let statusClass = "status-ok";

                        if (status === "expired") {
                            statusText = "Expired";
                            statusClass = "status-expired";
                        } else if (status === "soon") {
                            statusText = "Soon";
                            statusClass = "status-soon";
                        }

                        return (
                            <div key={item.id}>
                                <SwipeCard
                                    isActive={activeSwipeId === item.id}
                                    onActivate={() => setActiveSwipeId(item.id)}
                                    onCloseOther={() => setActiveSwipeId(null)}
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
                                                              diffDays !== 1
                                                                  ? "s"
                                                                  : ""
                                                          } left`
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
                                    </Card>
                                </SwipeCard>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}
