
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EthImage from "../images/ethereum.svg";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";

const ItemDetails = () => {
  const location = useLocation();
  const item = location.state?.item;

  const title = item?.title ?? "Rainbow Style #194";
  const image = item?.nftImage ?? nftImage;
  const likes = item?.likes ?? 74;
  const price = item?.price ?? 1.85;
  const authorImage = item?.authorImage ?? AuthorImage;

  const authorLink =
    item?.authorId != null
      ? `/author/${item.authorId}`
      : "/author";

  const authorName =
    item?.authorName ??
    (item?.authorId != null
      ? `Author #${item.authorId}`
      : "Monica Lucas");

  const [imageLoading, setImageLoading] = useState(true);
  const [authorImageLoading, setAuthorImageLoading] = useState(true);

  // Reset loading states when navigating to another NFT
  useEffect(() => {
    setImageLoading(true);
    setAuthorImageLoading(true);
    window.scrollTo(0, 0);
  }, [location.key, image, authorImage]);

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          aria-label="NFT details"
          className="mt90 sm-mt-0"
        >
          <div className="container">
            <div className="row">
              {/* NFT artwork */}
              <div className="col-md-6 text-center">
                <div className="item-details-image-container">
                  {imageLoading && (
                    <div
                      className="skeleton item-details-image-skeleton"
                      role="status"
                      aria-label="Loading NFT artwork"
                    />
                  )}

                  <img
                    key={image}
                    src={image}
                    className="img-fluid img-rounded mb-sm-30 nft-image"
                    alt={title}
                    style={{
                      display: imageLoading ? "none" : "block",
                    }}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                </div>
              </div>

              {/* NFT information */}
              <div className="col-md-6">
                <div className="item_info">
                  <h2>{title}</h2>

                  <div className="item_info_counts">
                    {!item && (
                      <div className="item_info_views">
                        <i className="fa fa-eye"></i>
                        100
                      </div>
                    )}

                    <div className="item_info_like">
                      <i className="fa fa-heart"></i>
                      {likes}
                    </div>
                  </div>

                  {!item && (
                    <p>
                      doloremque laudantium, totam rem aperiam,
                      eaque ipsa quae ab illo inventore
                      veritatis et quasi architecto beatae
                      vitae dicta sunt explicabo.
                    </p>
                  )}

                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Creator</h6>

                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={authorLink}>
                            {authorImageLoading && (
                              <div
                                className="skeleton item-details-avatar-skeleton"
                                aria-hidden="true"
                              />
                            )}

                            <img
                              key={authorImage}
                              className="lazy"
                              src={authorImage}
                              alt={authorName}
                              style={{
                                display: authorImageLoading
                                  ? "none"
                                  : "block",
                              }}
                              onLoad={() =>
                                setAuthorImageLoading(false)
                              }
                              onError={() =>
                                setAuthorImageLoading(false)
                              }
                            />

                            {!authorImageLoading && (
                              <i className="fa fa-check"></i>
                            )}
                          </Link>
                        </div>

                        <div className="author_list_info">
                          <Link to={authorLink}>
                            {authorName}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <div className="spacer-40"></div>

                      <h6>Price</h6>

                      <div className="nft-item-price">
                        <img
                          src={EthImage}
                          alt="Ethereum"
                        />
                        <span>{price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="spacer-20"></div>

                  <Link
                    to="/explore"
                    className="btn-main"
                  >
                    Back to Explore
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
