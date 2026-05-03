export default function Card({ children, icon }) {
    return (
        <div className="card">
            <div className="card-icon">{icon}</div>
            <div className="card-content">{children}</div>
        </div>
    );
}
