import React, { useEffect, useState } from "react";
import axios from "axios";
import { NFTCard, NFTSkeleton } from "../home/NewItems";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [retryCount, setRetryCount] = useState(0);

  // Fetch NFTs from Explore API
  useEffect(() => {
    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(API_URL, {
          params: filter ? { filter } : {},
          signal: controller.signal,
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response");
        }

        if (!controller.signal.aborted) {
          setItems(response.data);
          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error loading Explore items:", err);
          setError("Unable to load Explore items.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => controller.abort();
  }, [filter, retryCount]);

  // Update NFT countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Change sorting filter
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setVisibleCount(8);
  };

  // Display 4 additional NFTs
  const handleLoadMore = () => {
    setVisibleCount((previous) => Math.min(previous + 4, items.length));
  };

  return (
    <>
      {/* Sorting filter */}
      <div className="col-md-12">
        <select
          id="filter-items"
          value={filter}
          onChange={handleFilterChange}
          disabled={loading}
          aria-label="Sort NFTs"
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>

      {/* Reusable skeleton loading */}
      {loading && (
        <div className="col-md-12" role="status" aria-label="Loading NFTs">
          <div className="row explore-skeleton-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={`skeleton-${index}`}
                className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
              >
                <NFTSkeleton />
              </div>
            ))}
          </div>

          <span className="visually-hidden">Loading NFTs...</span>
        </div>
      )}

      {/* API error */}
      {!loading && error && (
        <div className="col-md-12 text-center">
          <p role="alert">{error}</p>

          <button
            type="button"
            className="btn-main"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty results */}
      {!loading && !error && items.length === 0 && (
        <div className="col-md-12 text-center">
          <p>No NFTs available.</p>
        </div>
      )}

      {/* NFT cards */}
      {!loading && !error && items.length > 0 && (
        <>
          {items.slice(0, visibleCount).map((item) => (
            <div
              key={item.nftId ?? item.id}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
            >
              <NFTCard item={item} now={now} />
            </div>
          ))}

          {/* Load more */}
          {visibleCount < items.length && (
            <div className="col-md-12 text-center">
              <button
                type="button"
                id="loadmore"
                className="btn-main lead"
                onClick={handleLoadMore}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ExploreItems;
