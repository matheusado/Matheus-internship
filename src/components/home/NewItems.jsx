import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

const formatCountdown = (expiryDate, now) => {
  const remaining = Math.max(0, Math.floor((expiryDate - now) / 1000));

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
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

  useEffect(() => {
    const controller = new AbortController();

    const fetchItems = async () => {
      try {
        const response = await axios.get(API_URL, {
          signal: controller.signal,
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response");
        }

        setItems(response.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      instanceRef.current?.update();
    }
  }, [items, instanceRef]);

  return (
    <section id="section-items" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="row">
            {[1, 2, 3, 4].map((item) => (
              <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={item}>
                <div className="nft__item">
                  <div className="skeleton-avatar skeleton"></div>
                  <div className="skeleton-image skeleton"></div>
                  <div className="skeleton-title skeleton"></div>
                  <div className="skeleton-code skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-center">No new items available.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="new-items-slider">
            <div ref={sliderRef} className="keen-slider">
              {items.map((item) => (
                <div className="keen-slider__slide" key={item.id}>
                  <div className="nft__item">
                    <div className="author_list_pp">
                      <Link
                        to="/author"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={`Creator: ${item.authorId}`}
                      >
                        <img
                          className="lazy"
                          src={item.authorImage}
                          alt={`Creator of ${item.title}`}
                        />
                        <i className="fa fa-check"></i>
                      </Link>
                    </div>

                    {typeof item.expiryDate === "number" &&
                      item.expiryDate > now && (
                        <div className="de_countdown">
                          {formatCountdown(item.expiryDate, now)}
                        </div>
                      )}

                    <div className="nft__item_wrap">
                      <div className="nft__item_extra">
                        <div className="nft__item_buttons">
                          <button type="button">Buy Now</button>
                          <div className="nft__item_share">
                            <h4>Share</h4>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <i className="fa fa-facebook fa-lg"></i>
                            </a>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <i className="fa fa-twitter fa-lg"></i>
                            </a>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <i className="fa fa-envelope fa-lg"></i>
                            </a>
                          </div>
                        </div>
                      </div>

                      <Link to="/item-details">
                        <img
                          src={item.nftImage}
                          className="lazy nft__item_preview"
                          alt={item.title}
                        />
                      </Link>
                    </div>

                    <div className="nft__item_info">
                      <Link to="/item-details">
                        <h4>{item.title}</h4>
                      </Link>

                      <div className="nft__item_price">{item.price} ETH</div>

                      <div className="nft__item_like">
                        <i className="fa fa-heart"></i>
                        <span>{item.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
