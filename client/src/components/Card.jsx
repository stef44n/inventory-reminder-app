export default function Card({ children, icon, className = "" }) {
    return (
        <div className={`card item-card ${className}`}>
            <div className="card-icon">{icon}</div>
            <div className="card-content">{children}</div>
        </div>
    );
}
