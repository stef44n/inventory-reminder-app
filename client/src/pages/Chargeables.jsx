import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import Header from "../components/Header";
import Card from "../components/Card";
import SwipeCard from "../components/SwipeCard";
import SkeletonCard from "../components/SkeletonCard";
import ItemToolbar from "../components/ItemToolbar";
import { isChargeableDue } from "../utils/itemStatus";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Chargeables() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [chargeCycleDays, setChargeCycleDays] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [activeSwipeId, setActiveSwipeId] = useState(null);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const nameInputRef = useRef(null);

    const fetchItems = async () => {
        try {
            setLoading(true);

            const res = await API.get("/chargeables");

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

        window.addEventListener("openAddChargeable", openForm);

        return () => {
            window.removeEventListener("openAddChargeable", openForm);
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

    const filteredItems = items
        .filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const isDue = isChargeableDue(item);

            if (activeFilter === "Due") {
                return matchesSearch && isDue;
            }

            if (activeFilter === "OK") {
                return matchesSearch && !isDue;
            }

            return matchesSearch;
        })
        .sort((a, b) => {
            const aDue = isChargeableDue(a);
            const bDue = isChargeableDue(b);

            if (aDue !== bDue) {
                return aDue ? -1 : 1;
            }

            return a.name.localeCompare(b.name);
        });

    return (
        <div className="container">
            <Header title="Chargeables" />

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
                                    className="date-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">
                                    Charge cycle (days)
                                </label>

                                <input
                                    type="number"
                                    className="date-input"
                                    value={chargeCycleDays}
                                    onChange={(e) =>
                                        setChargeCycleDays(e.target.value)
                                    }
                                />
                            </div>

                            <button type="submit" className="button-primary">
                                Save Item
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
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const isDue = isChargeableDue(item);

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                    scale: 0.96,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.92,
                                    y: -10,
                                }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                }}
                            >
                                <SwipeCard
                                    isActive={activeSwipeId === item.id}
                                    onActivate={() => setActiveSwipeId(item.id)}
                                    onCloseOther={() => setActiveSwipeId(null)}
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
                                                    {
                                                        item.chargeable
                                                            .chargeCycleDays
                                                    }{" "}
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
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            )}
        </div>
    );
}
