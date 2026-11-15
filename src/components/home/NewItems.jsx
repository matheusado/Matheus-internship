import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

// Normalize expiry timestamps to milliseconds
const getExpiryTime = (expiryDate) => {
  if (expiryDate == null) return null;

  const timestamp = Number(expiryDate);

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  return timestamp < 1e12 ? timestamp * 1000 : timestamp;
};

// Format countdown timer
const formatCountdown = (expiryDate, now) => {
  const expiryTime = getExpiryTime(expiryDate);

  if (expiryTime === null) return null;

  const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};

// Reusable NFT card for Home and Explore
export const NFTCard = ({ item, now = Date.now() }) => {
  const authorLink =
    item.authorId != null ? `/author/${item.authorId}` : "/author";

  const expiryTime = getExpiryTime(item.expiryDate);
  const hasCountdown = expiryTime !== null && expiryTime > now;

  return (
    <div className="nft__item">
      {/* Creator avatar */}
      <div className="author_list_pp">
        <Link to={authorLink} title={`Creator: ${item.authorId ?? "Unknown"}`}>
          <img
            className="lazy"
            src={item.authorImage}
            alt={`Creator of ${item.title}`}
          />
          <i className="fa fa-check"></i>
        </Link>
      </div>

      {/* Live countdown timer */}
      {hasCountdown && (
        <div className="de_countdown">
          {formatCountdown(item.expiryDate, now)}
        </div>
      )}

      {/* NFT artwork */}
      <div className="nft__item_wrap">
        <div className="nft__item_extra">
          <div className="nft__item_buttons">
            <button type="button">Buy Now</button>

            <div className="nft__item_share">
              <h4>Share</h4>

              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                aria-label="Share on Facebook"
              >
                <i className="fa fa-facebook fa-lg"></i>
              </a>

              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                aria-label="Share on Twitter"
              >
                <i className="fa fa-twitter fa-lg"></i>
              </a>

              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                aria-label="Share by email"
              >
                <i className="fa fa-envelope fa-lg"></i>
              </a>
            </div>
          </div>
        </div>

        <Link
          to={
            item.nftId != null ? `/item-details/${item.nftId}` : "/item-details"
          }
          state={{ item }}
        >
          <img
            src={item.nftImage}
            className="lazy nft__item_preview"
            alt={item.title}
          />
        </Link>
      </div>

      {/* NFT information */}
      <div className="nft__item_info">
        <Link
          to={
            item.nftId != null ? `/item-details/${item.nftId}` : "/item-details"
          }
          state={{ item }}
        >
          <h4>{item.title}</h4>
        </Link>

        <div className="nft__item_price">{item.price} ETH</div>

        <div className="nft__item_like">
          <i className="fa fa-heart"></i>
          <span>{item.likes ?? 0}</span>
        </div>
      </div>
    </div>
  );
};

// Reusable skeleton for Home and Explore
export const NFTSkeleton = ({ showCountdown = false }) => {
  return (
    <div className="nft__item nft-skeleton-card" aria-hidden="true">
      {/* Creator avatar */}
      <div className="author_list_pp">
        <div className="skeleton skeleton-avatar"></div>
      </div>

      {/* Optional countdown skeleton */}
      {showCountdown && <div className="skeleton skeleton-countdown"></div>}

      {/* NFT artwork skeleton */}
      <div className="nft__item_wrap">
        <div className="skeleton skeleton-image"></div>
      </div>

      {/* NFT information skeleton */}
      <div className="nft__item_info">
        <div className="skeleton skeleton-title"></div>

        <div className="nft-skeleton-bottom">
          <div className="skeleton skeleton-code"></div>
          <div className="skeleton skeleton-likes"></div>
        </div>
      </div>
    </div>
  );
};

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Responsive NFT carousel
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: items.length > 4,

    slides: {
      perView: 4,
      spacing: 16,
    },

    breakpoints: {
      "(max-width: 1024px)": {
        slides: {
          perView: 2,
          spacing: 12,
        },
      },

      "(max-width: 600px)": {
        slides: {
          perView: 1,
          spacing: 10,
        },
      },
    },
  });

  // Fetch New Items from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(API_URL, {
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
          console.error("Error loading New Items:", err);

          setError("Unable to load new items.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => controller.abort();
  }, []);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update carousel when API data changes
  useEffect(() => {
    if (items.length > 0) {
      instanceRef.current?.update({
        loop: items.length > 4,
      });
    }
  }, [items, instanceRef]);

  return (
    <section id="section-items" className="no-bottom">
      <div className="container">
        {/* Section heading */}
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div
            className="row explore-skeleton-grid"
            role="status"
            aria-label="Loading new NFTs"
          >
            {[1, 2, 3, 4].map((item) => (
              <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={item}>
                <NFTSkeleton showCountdown={item === 1 || item === 4} />
              </div>
            ))}
          </div>
        )}

        {/* API error */}
        {!loading && error && (
          <p className="text-center" role="alert">
            {error}
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <p className="text-center">No new items available.</p>
        )}

        {/* NFT carousel */}
        {!loading && !error && items.length > 0 && (
          <div className="new-items-slider">
            <div ref={sliderRef} className="keen-slider">
              {items.map((item) => (
                <div className="keen-slider__slide" key={item.nftId ?? item.id}>
                  <NFTCard item={item} now={now} />
                </div>
              ))}
            </div>

            {/* Carousel navigation */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  className="new-items-arrow new-items-prev"
                  onClick={() => instanceRef.current?.prev()}
                  aria-label="Previous NFT"
                >
                  &#10094;
                </button>

                <button
                  type="button"
                  className="new-items-arrow new-items-next"
                  onClick={() => instanceRef.current?.next()}
                  aria-label="Next NFT"
                >
                  &#10095;
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewItems;
