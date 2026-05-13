export default function SkeletonCard() {
    return (
        <div className="card skeleton-card">
            <div className="skeleton-icon"></div>

            <div className="skeleton-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
        </div>
    );
}
