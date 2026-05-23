export default function ItemToolbar({
    search,
    setSearch,
    filters = [],
    activeFilter,
    setActiveFilter,
    addLabel,
    onAddClick,
}) {
    return (
        <div className="toolbar">
            {/* SEARCH */}
            <input
                className="toolbar-search"
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* FILTERS */}
            {filters.length > 0 && (
                <div className="toolbar-filters">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            type="button"
                            className={`filter-chip ${
                                activeFilter === filter ? "active" : ""
                            }`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            )}

            {/* ADD BUTTON */}
            <button className="add-item-button" onClick={onAddClick}>
                {addLabel}
            </button>
        </div>
    );
}
