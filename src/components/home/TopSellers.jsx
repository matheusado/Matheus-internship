import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const TopSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSellers = async () => {
      try {
        const response = await axios.get(API_URL, {
          signal: controller.signal,
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response");
        }

        setSellers(response.data);
      } catch (err) {
        if (!axios.isCancel(err) && !controller.signal.aborted) {
          console.error("Error loading Top Sellers:", err);
          setError("Unable to load top sellers.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSellers();

    return () => controller.abort();
  }, []);

  return (
    <section id="section-popular" className="pb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-md-12">
            {loading ? (
              <ol className="author_list">
                {Array.from({ length: 12 }, (_, index) => (
                  <li key={index}>
                    <div className="author_list_pp">
                      <div className="seller-skeleton-avatar skeleton" />
                    </div>

                    <div className="author_list_info">
                      <div className="seller-skeleton-name skeleton" />
                      <div className="seller-skeleton-price skeleton" />
                    </div>
                  </li>
                ))}
              </ol>
            ) : error ? (
              <p className="text-center" role="alert">
                {error}
              </p>
            ) : sellers.length === 0 ? (
              <p className="text-center">No sellers available.</p>
            ) : (
              <ol className="author_list">
                {sellers.map((seller) => (
                  <li key={seller.id}>
                    <div className="author_list_pp">
                      <Link
                        to={`/author/${seller.authorId}`}
                        title={`View ${seller.authorName}'s profile`}
                      >
                        <img
                          className="lazy pp-author"
                          src={seller.authorImage}
                          alt={seller.authorName}
                        />
                        <i className="fa fa-check"></i>
                      </Link>
                    </div>

                    <div className="author_list_info">
                      <Link to={`/author/${seller.authorId}`}>
                        {seller.authorName}
                      </Link>

                      <span>{seller.price} ETH</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;
