import { useEffect, useState } from "react";

export default function AdminReviewTracker() {
    const [reviews, setReviews] = useState([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const limit = 10;

    // Highlight helper
    function highlight(text, search) {
        if (!search) return text;

        const regex = new RegExp(`(${search})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    }

    useEffect(() => {
        setLoading(true);

        fetch(
            `http://localhost:5000/api/admin/reviews/all?page=${page}&limit=${limit}&search=${search}&sort=${sort}`,
            { credentials: "include" }
        )
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReviews(data.reviews);
                    setTotal(data.total);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [page, search, sort]);

    async function deleteReview(reviewId) {
        const res = await fetch(
            `http://localhost:5000/api/admin/reviews/${reviewId}`,
            { method: "DELETE", credentials: "include" }
        );

        const data = await res.json();
        if (!data.success) return;

        setReviews(prev => prev.filter(r => r.review_id !== reviewId));
        setConfirmDeleteId(null);
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="admin-review-tracker">
            <title>Track all revies-Miro Kitchen</title>
            <h2 className="admin-review-title">All Reviews Across All Items</h2>

            {/* Search + Sort Controls */}
            <div className="admin-controls">
                <input
                    className="admin-search-input"
                    placeholder="Search reviews..."
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />

                <select
                    className="admin-sort-select"
                    value={sort}
                    onChange={e => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">Reviewer A → Z</option>
                    <option value="za">Reviewer Z → A</option>
                    <option value="longest">Longest Reviews</option>
                    <option value="shortest">Shortest Reviews</option>
                </select>
            </div>

            {/* Loading */}
            {loading && <p className="review-info">Loading reviews…</p>}

            {/* Empty State */}
            {!loading && reviews.length === 0 && (
                <p className="review-info">No reviews found.</p>
            )}

            {/* Review List */}
            <div className="admin-review-list">
                {reviews.map(r => (
                    <div key={r.review_id} className="admin-review-card">
                        <div className="admin-review-header">
                            <div className="admin-review-meta">
                                <strong>{highlight(r.full_name, search)}</strong>
                                <span className="admin-review-item">
                                    on {highlight(r.item_name, search)}
                                </span>
                            </div>

                            <button
                                className="delete-review-btn"
                                onClick={() => setConfirmDeleteId(r.review_id)}
                            >
                                Delete
                            </button>
                        </div>

                        <hr />

                        <p className="admin-review-text">
                            {highlight(r.review_description, search)}
                        </p>

                        {/* Delete Modal */}
                        {confirmDeleteId === r.review_id && (
                            <div className="confirm-overlay">
                                <div className="confirm-modal">
                                    <p>Are you sure you want to delete this review?</p>

                                    <div className="confirm-buttons">
                                        <button
                                            className="confirm-yes"
                                            onClick={() => deleteReview(r.review_id)}
                                        >
                                            Yes, delete
                                        </button>

                                        <button
                                            className="confirm-no"
                                            onClick={() => setConfirmDeleteId(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                >
                    Previous
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
