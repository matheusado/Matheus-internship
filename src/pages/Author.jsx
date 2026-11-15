import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";

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
          (seller) => String(seller.authorId) === authorId,
        );

        if (!selectedAuthor) {
          throw new Error("Author not found");
        }

        setAuthor(selectedAuthor);
      } catch (err) {
        if (!axios.isCancel(err) && !controller.signal.aborted) {
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
            {loading ? (
              <div className="profile_avatar">
                <div className="seller-skeleton-avatar skeleton" />
                <div className="seller-skeleton-name skeleton" />
                <div className="seller-skeleton-price skeleton" />
              </div>
            ) : error ? (
              <p className="text-center" role="alert">
                {error}
              </p>
            ) : (
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
