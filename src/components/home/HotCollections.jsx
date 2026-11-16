import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import axios from "axios";
import AOS from "aos";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections";

const HotCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const fetchCollections = async () => {
      try {
        const response = await axios.get(API_URL, {
          signal: controller.signal,
        });

        if (!Array.isArray(response.data)) {
          throw new Error("API response is not an array");
        }

        if (!controller.signal.aborted) {
          setCollections(response.data);
          setError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching collections:", err);
          setError("Unable to load collections.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCollections();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (collections.length > 0) {
      instanceRef.current?.update();
    }
  }, [collections, instanceRef]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      AOS.refreshHard();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, collections]);

  return (
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center" data-aos="fade-up" data-aos-duration="700">
              <h2>Hot Collections</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="row">
            {[1, 2, 3, 4].map((item) => (
              <div className="col-lg-3 col-md-6 col-sm-6" key={item}>
                <div className="nft_coll skeleton-card">
                  <div className="skeleton-image skeleton"></div>
                  <div className="skeleton-avatar skeleton"></div>
                  <div className="skeleton-title skeleton"></div>
                  <div className="skeleton-code skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center">
            <p role="alert">{error}</p>
          </div>
        )}

        {!loading && !error && collections.length === 0 && (
          <div className="text-center">
            <p>No collections available.</p>
          </div>
        )}

        {!loading && !error && collections.length > 0 && (
          <div className="hot-collections-slider">
            <div ref={sliderRef} className="keen-slider">
              {collections.map((collection, index) => {
                const collectionItem = {
                  ...collection,
                  title: collection.title,
                  nftImage: collection.nftImage,
                  authorImage: collection.authorImage,
                  authorId: collection.authorId,
                  type: "collection",
                };

                return (
                  <div className="keen-slider__slide" key={collection.id}>
                    <div
                      data-aos="zoom-in"
                      data-aos-anchor="#section-collections"
                      data-aos-duration="600"
                      data-aos-delay={Math.min(index, 3) * 80}
                    >
                    <div className="nft_coll">
                      <div className="nft_wrap">
                        <Link
                          to={
                            collection.nftId != null
                              ? `/item-details/${collection.nftId}`
                              : "/item-details"
                          }
                          state={{ item: collectionItem }}
                        >
                          <img
                            src={collection.nftImage}
                            className="lazy img-fluid"
                            alt={collection.title}
                          />
                        </Link>
                      </div>

                      <div className="nft_coll_pp">
                        <Link
                          to={
                            collection.authorId != null
                              ? `/author/${collection.authorId}`
                              : "/author"
                          }
                        >
                          <img
                            className="lazy pp-coll"
                            src={collection.authorImage}
                            alt={`${collection.title} creator`}
                          />
                        </Link>
                        <i className="fa fa-check"></i>
                      </div>

                      <div className="nft_coll_info">
                        <Link
                          to={
                            collection.nftId != null
                              ? `/item-details/${collection.nftId}`
                              : "/item-details"
                          }
                          state={{ item: collectionItem }}
                        >
                          <h4>{collection.title}</h4>
                        </Link>

                        <span>ERC-{collection.code}</span>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {collections.length > 1 && (
              <>
                <button
                  type="button"
                  className="hot-slider-arrow hot-slider-prev"
                  onClick={() => instanceRef.current?.prev()}
                  aria-label="Previous collection"
                >
                  &#10094;
                </button>

                <button
                  type="button"
                  className="hot-slider-arrow hot-slider-next"
                  onClick={() => instanceRef.current?.next()}
                  aria-label="Next collection"
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

export default HotCollections;
