import { useEffect, useState } from "react";

export default function ReviewSection({ itemId, user }) {
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState("");
    const [canReview, setCanReview] = useState(false);
    const [userReviewId, setUserReviewId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 5;

    const totalPages = Math.max(1, Math.ceil(total / limit));

    useEffect(() => {
        fetch(
            `http://localhost:5000/api/reviews/${itemId}?page=${page}&limit=${limit}&sort=${sort}`
        )
            .then(res => res.json())
            .then(data => {
                if (!data.success) return;

                setReviews(data.reviews);
                setTotal(data.total);

                const correctedTotalPages = Math.max(
                    1,
                    Math.ceil(data.total / limit)
                );
                if (page > correctedTotalPages) {
                    setPage(correctedTotalPages);
                }

                if (user) {
                    const own = data.reviews.find(
                        r => r.user_id === user.user_id
                    );
                    if (own) {
                        setUserReview(own.review_description);
                        setUserReviewId(own.review_id);
                        setCharCount(own.review_description.length);
                    } else {
                        setUserReview("");
                        setUserReviewId(null);
                        setCharCount(0);
                    }
                }
            });

        if (user && !user.is_admin) {
            fetch(
                `http://localhost:5000/api/reviews/can-review/${itemId}`,
                { credentials: "include" }
            )
                .then(res => res.json())
                .then(
                    data => data.success && setCanReview(data.canReview)
                );
        }
    }, [itemId, user, page, sort]);

    async function validateReview(text) {
        const res = await fetch(
            "http://localhost:5000/api/reviews/moderate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            }
        );

        const data = await res.json();
        setErrorMessage(data.error || "");
    }

    async function submitReview() {
        if (!userReview.trim()) return;

        const isUpdate = Boolean(userReviewId);
        const url = isUpdate
            ? `http://localhost:5000/api/reviews/${userReviewId}`
            : "http://localhost:5000/api/reviews/create";
        const method = isUpdate ? "PATCH" : "POST";

        const res = await fetch(url, {
            method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, review: userReview })
        });

        const data = await res.json();
        if (!data.success) {
            if (data.error) setErrorMessage(data.error);
            return;
        }

        setErrorMessage("");

        if (isUpdate) {
            setReviews(prev =>
                prev.map(r =>
                    r.review_id === userReviewId
                        ? { ...r, review_description: userReview }
                        : r
                )
            );
        } else {
            setReviews(prev => [...prev, data.review]);
            setUserReviewId(data.review.review_id);
        }

        setIsEditing(false);
    }

    async function deleteReview(reviewId) {
        const res = await fetch(
            `http://localhost:5000/api/reviews/${reviewId}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        const data = await res.json();
        if (!data.success) return;

        setReviews(prev => prev.filter(r => r.review_id !== reviewId));

        if (reviewId === userReviewId) {
            setUserReview("");
            setUserReviewId(null);
            setCharCount(0);
            setIsEditing(false);
        }

        setConfirmDeleteId(null);
    }

    const showLoginMessage = !user;
    const showAdminMessage = user?.is_admin;
    const showCannotReview =
        user && !user.is_admin && !canReview && !userReviewId;
    const showReviewForm =
        user && !user.is_admin && (canReview || userReviewId);

    return (
        <div className="review-section">
            <div className="review-header">
                <h3>Reviews</h3>

                {user?.is_admin && (
                    <button
                        className="track-reviews-btn"
                        onClick={() =>
                            (window.location.href = "/admin/reviews")
                        }
                    >
                        Track All Reviews
                    </button>
                )}
            </div>

            {/* Sorting */}
            <select
                className="review-sort-select"
                value={sort}
                onChange={e => {
                    setSort(e.target.value);
                    setPage(1);
                }}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="longest">Longest Reviews</option>
                <option value="shortest">Shortest Reviews</option>
            </select>

            {showLoginMessage && (
                <p className="review-info">
                    You must <strong>log in</strong> to leave a review.
                </p>
            )}

            {showAdminMessage && (
                <p className="review-info">Admins cannot leave reviews.</p>
            )}

            {showCannotReview && (
                <p className="review-info">
                    You can only review items you have purchased.
                </p>
            )}

            {showReviewForm && (
                <div className="review-form">
                    <textarea
                        value={userReview}
                        onChange={e => {
                            const value = e.target.value;
                            setUserReview(value);
                            setCharCount(value.length);
                            validateReview(value);
                        }}
                        placeholder={
                            userReviewId
                                ? "Edit your review..."
                                : "Write your review..."
                        }
                        className="review-textarea"
                    />

                    <p className="char-counter">{charCount}/372</p>

                    {errorMessage && (
                        <p className="review-error">{errorMessage}</p>
                    )}

                    <div className="review-form-actions">
                        <button
                            className="submit-review-btn"
                            onClick={submitReview}
                            disabled={!!errorMessage}
                        >
                            {userReviewId ? "Update Review" : "Submit Review"}
                        </button>

                        {userReviewId && (
                            <button
                                className="delete-review-btn"
                                onClick={() =>
                                    setConfirmDeleteId(userReviewId)
                                }
                            >
                                Delete Review
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Review List */}
            <div className="review-list">
                {reviews.length === 0 && (
                    <p className="no-reviews">No reviews yet.</p>
                )}

                {reviews.map(r => (
                    <div key={r.review_id} className="review-card">
                        <p className="review-user">
                            <strong>{r.full_name}</strong>
                        </p>
                        <hr />
                        <p className="review-text">
                            {r.review_description}
                        </p>

                        {user && r.user_id === user.user_id && (
                            <div className="review-actions-inline">
                                <button
                                    className="inline-edit-btn"
                                    onClick={() => {
                                        setUserReview(
                                            r.review_description
                                        );
                                        setUserReviewId(r.review_id);
                                        setCharCount(
                                            r.review_description.length
                                        );
                                        setIsEditing(true);
                                        setErrorMessage("");
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    className="inline-delete-btn"
                                    onClick={() =>
                                        setConfirmDeleteId(r.review_id)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button
                    disabled={page <= 1}
                    onClick={() =>
                        setPage(p => Math.max(1, p - 1))
                    }
                >
                    Previous
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page >= totalPages}
                    onClick={() =>
                        setPage(p => Math.min(totalPages, p + 1))
                    }
                >
                    Next
                </button>
            </div>

            {/* Delete Modal */}
            {confirmDeleteId && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <p>
                            Are you sure you want to delete this
                            review?
                        </p>
                        <div className="confirm-buttons">
                            <button
                                className="confirm-yes"
                                onClick={() =>
                                    deleteReview(confirmDeleteId)
                                }
                            >
                                Yes, delete
                            </button>
                            <button
                                className="confirm-no"
                                onClick={() =>
                                    setConfirmDeleteId(null)
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
