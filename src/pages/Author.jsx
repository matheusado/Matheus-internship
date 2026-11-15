import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import { NFTSkeleton } from "../components/home/NewItems";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const Author = () => {
  const { authorId } = useParams();

  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAuthor = async () => {
      setLoading(true);
      setError(null);
      setAuthor(null);

      try {
        const response = await axios.get(API_URL, {
          signal: controller.signal,
        });

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid API response");
        }

        const selectedAuthor = response.data.find(
          (seller) => String(seller.authorId) === String(authorId),
        );

        if (!selectedAuthor) {
          throw new Error("Author not found");
        }

        if (!controller.signal.aborted) {
          setAuthor(selectedAuthor);
        }
      } catch (err) {
        if (!axios.isCancel(err) && !controller.signal.aborted) {
          console.error("Error loading author:", err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (authorId) {
      fetchAuthor();
    } else {
      setError("No author selected.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [authorId]);

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        {/* Author banner */}
        <section
          id="profile_banner"
          aria-label="Author profile banner"
          className="text-light"
          style={{
            background: `url(${AuthorBanner}) top`,
          }}
        ></section>

        <section aria-label="Author profile">
          <div className="container">
            {/* Loading skeleton */}
            {loading && (
              <div
                className="row"
                role="status"
                aria-label="Loading author profile"
              >
                <div className="col-md-12">
                  <div className="d_profile de-flex">
                    <div className="de-flex-col">
                      <div className="profile_avatar author-profile-skeleton">
                        <div className="skeleton author-profile-avatar-placeholder"></div>

                        <div className="author-profile-text">
                          <div className="skeleton author-profile-name-placeholder"></div>
                          <div className="skeleton author-profile-id-placeholder"></div>
                        </div>
                      </div>
                    </div>

                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                        <div className="skeleton author-profile-price-placeholder"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NFT grid skeletons */}
                <div className="col-md-12">
                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <div className="tab-1">
                        <div className="row explore-skeleton-grid">
                          {Array.from({ length: 8 }, (_, index) => (
                            <div
                              key={index}
                              className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                            >
                              <NFTSkeleton />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <p className="text-center" role="alert">
                {error}
              </p>
            )}

            {/* Loaded author profile */}
            {!loading && !error && author && (
              <div className="row">
                <div className="col-md-12">
                  <div className="d_profile de-flex">
                    <div className="de-flex-col">
                      <div className="profile_avatar">
                        <img src={author.authorImage} alt={author.authorName} />

                        <i className="fa fa-check"></i>

                        <div className="profile_name">
                          <h4>
                            {author.authorName}

                            <span className="profile_username">
                              Author #{author.authorId}
                            </span>
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                        <div className="profile_follower">
                          {author.price} ETH
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="de_tab tab_simple">
                    <AuthorItems authorId={author.authorId} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
