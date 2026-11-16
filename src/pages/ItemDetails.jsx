import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import EthImage from "../images/ethereum.svg";
import AOS from "aos";

const ITEM_DETAILS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails";

const imageRequestSettled = (node, src) => {
  if (!node || !src || node.getAttribute("src") !== src || !node.complete) {
    return false;
  }

  return node.naturalWidth > 0 || node.naturalWidth === 0;
};

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
    if (imageRequestSettled(imageRef.current, src)) {
      setLoadedSrc(src);
    }
  }, [src]);

  const finishLoading = (event) => {
    if (imageRequestSettled(event.currentTarget, src)) {
      setLoadedSrc(src);
    }
  };

  return (
    <>
      <div className={`${frameClassName}${ready ? "" : " is-loading"}`}>
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

const personFromDetails = (details, role) => {
  const id = details?.[`${role}Id`];
  const name = details?.[`${role}Name`];
  const image = details?.[`${role}Image`];

  if (id == null || !name || !image) {
    return null;
  }

  return { id, name, image };
};

const PeopleSkeleton = () => (
  <div className="item-details-people" aria-hidden="true">
    {["Owner", "Creator"].map((label) => (
      <div className="item-details-person" key={label}>
        <h6>{label}</h6>
        <div className="item_author">
          <div className="author_list_pp">
            <div className="item-details-avatar-frame">
              <div className="skeleton item-details-avatar-skeleton" />
            </div>
          </div>
          <div className="author_list_info">
            <div className="skeleton item-details-name-skeleton" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DetailPerson = ({ label, person }) => {
  const profileLink = `/author/${person.id}`;

  return (
    <div className="item-details-person">
      <h6>{label}</h6>
      <div className="item_author">
        <div className="author_list_pp">
          <Link to={profileLink}>
            <DetailImage
              src={person.image}
              alt={person.name}
              className="lazy"
              frameClassName="item-details-avatar-frame"
              skeletonClassName="item-details-avatar-skeleton"
              skeletonLabel={`Loading ${label.toLowerCase()} image`}
            >
              <i className="fa fa-check"></i>
            </DetailImage>
          </Link>
        </div>
        <div className="author_list_info">
          <Link to={profileLink}>{person.name}</Link>
        </div>
      </div>
    </div>
  );
};

const ItemDetailsSkeleton = () => (
  <div className="row" role="status" aria-label="Loading NFT details">
    <div className="col-md-6 text-center">
      <div className="item-details-image-container is-loading">
        <div className="skeleton item-details-image-skeleton" />
      </div>
    </div>
    <div className="col-md-6">
      <div className="item_info">
        <div className="skeleton item-details-title-skeleton" />
        <div className="item_info_counts">
          <div className="skeleton item-details-likes-skeleton" />
          <div className="skeleton item-details-likes-skeleton" />
        </div>
        <div className="skeleton item-details-description-skeleton" />
        <PeopleSkeleton />
        <h6>Price</h6>
        <div className="skeleton item-details-price-skeleton" />
      </div>
    </div>
  </div>
);

const ItemDetails = () => {
  const { nftId } = useParams();
  const [view, setView] = useState(() => ({
    nftId,
    status: nftId ? "loading" : "missing",
    item: null,
    error: nftId ? null : "No NFT selected.",
  }));
  const [retryCount, setRetryCount] = useState(0);

  if (view.nftId !== nftId) {
    setView({
      nftId,
      status: nftId ? "loading" : "missing",
      item: null,
      error: nftId ? null : "No NFT selected.",
    });
  }

  const item = view.nftId === nftId ? view.item : null;
  const status = view.nftId === nftId ? view.status : "loading";
  const error = view.nftId === nftId ? view.error : null;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!nftId) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchItem = async () => {
      setView({
        nftId,
        status: "loading",
        item: null,
        error: null,
      });

      try {
        const response = await axios.get(ITEM_DETAILS_URL, {
          params: { nftId },
          signal: controller.signal,
        });
        const data = response.data;

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          String(data.nftId) !== String(nftId)
        ) {
          throw new Error("not-found");
        }

        if (!controller.signal.aborted) {
          setView({
            nftId,
            status: "ready",
            item: data,
            error: null,
          });
        }
      } catch (err) {
        if (axios.isCancel(err) || controller.signal.aborted) {
          return;
        }

        console.error("Error loading item details:", err);
        const notFound = err?.message === "not-found";
        setView({
          nftId,
          status: "error",
          item: null,
          error: notFound
            ? "This NFT could not be found."
            : "Unable to load this NFT.",
        });
      }
    };

    fetchItem();

    return () => controller.abort();
  }, [nftId, retryCount]);

  useEffect(() => {
    if (status !== "ready" || !item) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      AOS.refreshHard();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [status, item]);

  const owner = personFromDetails(item, "owner");
  const creator = personFromDetails(item, "creator");
  const title = item?.tag != null ? `${item.title} #${item.tag}` : item?.title;

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>
        <section aria-label="NFT details" className="mt90 sm-mt-0">
          <div className="container">
            {status === "loading" && <ItemDetailsSkeleton />}

            {status !== "loading" && error && (
              <div className="row">
                <div className="col-md-12 text-center">
                  <p role="alert">{error}</p>
                  {nftId && status === "error" && error !== "This NFT could not be found." && (
                    <button
                      type="button"
                      className="btn-main"
                      onClick={() => setRetryCount((count) => count + 1)}
                    >
                      Retry
                    </button>
                  )}
                  <div className="spacer-20"></div>
                  <Link to="/explore" className="btn-main">
                    Back to Explore
                  </Link>
                </div>
              </div>
            )}

            {status === "ready" && item && (
              <div className="row">
                <div
                  className="col-md-6 text-center"
                  data-aos="fade-right"
                  data-aos-duration="700"
                >
                  <DetailImage
                    src={item.nftImage}
                    alt={item.title || "NFT artwork"}
                    className="img-fluid img-rounded mb-sm-30 nft-image"
                    frameClassName="item-details-image-container"
                    skeletonClassName="item-details-image-skeleton"
                    skeletonLabel="Loading NFT artwork"
                  />
                </div>

                <div
                  className="col-md-6"
                  data-aos="fade-left"
                  data-aos-duration="700"
                  data-aos-delay="100"
                >
                  <div className="item_info">
                    {title && <h2>{title}</h2>}

                    {(item.views != null || item.likes != null) && (
                      <div className="item_info_counts">
                        {item.views != null && (
                          <div className="item_info_views">
                            <i className="fa fa-eye"></i>
                            {item.views}
                          </div>
                        )}
                        {item.likes != null && (
                          <div className="item_info_like">
                            <i className="fa fa-heart"></i>
                            {item.likes}
                          </div>
                        )}
                      </div>
                    )}

                    {item.description && <p>{item.description}</p>}

                    <div className="item-details-people">
                      {owner && <DetailPerson label="Owner" person={owner} />}
                      {creator && (
                        <DetailPerson label="Creator" person={creator} />
                      )}
                    </div>

                    <div className="de_tab tab_simple">
                      <div className="de_tab_content">
                        <h6>Price</h6>
                        {item.price != null && (
                          <div className="nft-item-price">
                            <img src={EthImage} alt="Ethereum" />
                            <span>{item.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
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

export default ItemDetails;
