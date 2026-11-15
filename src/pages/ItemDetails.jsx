
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EthImage from "../images/ethereum.svg";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";

const ENTRY_TRANSITION_MS = 300;

const DetailImage = ({
  src,
  alt,
  className,
  frameClassName,
  skeletonClassName,
  skeletonLabel,
  children,
}) => {
  const imageRef = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const ready = loadedSrc === src;

  useEffect(() => {
    const node = imageRef.current;

    if (node?.complete && node.getAttribute("src") === src) {
      setLoadedSrc(src);
    }
  }, [src]);

  const finishLoading = (event) => {
    if (event.currentTarget.getAttribute("src") === src) {
      setLoadedSrc(src);
    }
  };

  return (
    <>
      <div className={frameClassName}>
        {!ready && (
          <div
            className={`skeleton ${skeletonClassName}`}
            role="status"
            aria-label={skeletonLabel}
          />
        )}

        <img
          ref={imageRef}
          src={src}
          className={className}
          alt={alt}
          style={{ opacity: ready ? 1 : 0 }}
          onLoad={finishLoading}
          onError={finishLoading}
        />
      </div>

      {ready ? children : null}
    </>
  );
};

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

  const [entryState, setEntryState] = useState(() => ({
    id: location.key,
    ready: false,
  }));

  if (entryState.id !== location.key) {
    setEntryState({ id: location.key, ready: false });
  }

  const entryReady = entryState.ready && entryState.id === location.key;

  useEffect(() => {
    window.scrollTo(0, 0);

    const timer = window.setTimeout(() => {
      setEntryState((current) =>
        current.id === location.key
          ? { id: location.key, ready: true }
          : current
      );
    }, ENTRY_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [location.key]);

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
                {entryReady ? (
                  <DetailImage
                    src={image}
                    alt={title}
                    className="img-fluid img-rounded mb-sm-30 nft-image"
                    frameClassName="item-details-image-container"
                    skeletonClassName="item-details-image-skeleton"
                    skeletonLabel="Loading NFT artwork"
                  />
                ) : (
                  <div className="item-details-image-container">
                    <div
                      className="skeleton item-details-image-skeleton"
                      role="status"
                      aria-label="Loading NFT artwork"
                    />
                  </div>
                )}
              </div>

              {/* NFT information */}
              <div className="col-md-6">
                <div className="item_info">
                  {entryReady ? (
                    <h2>{title}</h2>
                  ) : (
                    <div
                      className="skeleton item-details-title-skeleton"
                      role="status"
                      aria-label="Loading NFT title"
                    />
                  )}

                  <div className="item_info_counts">
                    {entryReady && !item && (
                      <div className="item_info_views">
                        <i className="fa fa-eye"></i>
                        100
                      </div>
                    )}

                    {entryReady ? (
                      <div className="item_info_like">
                        <i className="fa fa-heart"></i>
                        {likes}
                      </div>
                    ) : (
                      <div
                        className="skeleton item-details-likes-skeleton"
                        role="status"
                        aria-label="Loading likes"
                      />
                    )}
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
                          {entryReady ? (
                            <Link to={authorLink}>
                              <DetailImage
                                src={authorImage}
                                alt={authorName}
                                className="lazy"
                                frameClassName="item-details-avatar-frame"
                                skeletonClassName="item-details-avatar-skeleton"
                                skeletonLabel="Loading creator image"
                              >
                                <i className="fa fa-check"></i>
                              </DetailImage>
                            </Link>
                          ) : (
                            <div className="item-details-avatar-frame">
                              <div
                                className="skeleton item-details-avatar-skeleton"
                                role="status"
                                aria-label="Loading creator image"
                              />
                            </div>
                          )}
                        </div>

                        <div className="author_list_info">
                          {entryReady ? (
                            <Link to={authorLink}>
                              {authorName}
                            </Link>
                          ) : (
                            <div
                              className="skeleton item-details-name-skeleton"
                              role="status"
                              aria-label="Loading creator name"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <div className="spacer-40"></div>

                      <h6>Price</h6>

                      {entryReady ? (
                        <div className="nft-item-price">
                          <img
                            src={EthImage}
                            alt="Ethereum"
                          />
                          <span>{price}</span>
                        </div>
                      ) : (
                        <div
                          className="skeleton item-details-price-skeleton"
                          role="status"
                          aria-label="Loading price"
                        />
                      )}
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
