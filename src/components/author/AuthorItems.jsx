import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const imageRequestSettled = (node, src) => {
  if (!node || !src || node.getAttribute("src") !== src || !node.complete) {
    return false;
  }

  return node.naturalWidth > 0 || node.naturalWidth === 0;
};

const AuthorCardImage = ({
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
      <span className={frameClassName}>
        {!ready && (
          <span
            className={`skeleton ${skeletonClassName}`}
            role="status"
            aria-label={skeletonLabel}
          />
        )}

        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={className}
          style={{ opacity: ready ? 1 : 0 }}
          onLoad={finishLoading}
          onError={finishLoading}
        />
      </span>

      {ready ? children : null}
    </>
  );
};

const AuthorItems = ({ author }) => {
  const items = Array.isArray(author?.nftCollection)
    ? author.nftCollection
    : [];
  const authorLink =
    author?.authorId != null ? `/author/${author.authorId}` : "/author";

  if (items.length === 0) {
    return <p className="text-center">This author has no NFTs.</p>;
  }

  return (
    <div className="de_tab_content">
      <div className="tab-1">
        <div className="row">
          {items.map((nft, index) => {
            const detailsItem = {
              ...nft,
              authorId: author.authorId,
              authorName: author.authorName,
              authorImage: author.authorImage,
            };

            return (
              <div
                className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                key={nft.nftId ?? nft.id}
                data-aos="zoom-in"
                data-aos-duration="600"
                data-aos-delay={Math.min(index % 4, 3) * 80}
              >
                <div className="nft__item">
                  <div className="author_list_pp">
                    <Link to={authorLink} title={author.authorName}>
                      <AuthorCardImage
                        src={author.authorImage}
                        alt={author.authorName || ""}
                        className="lazy"
                        frameClassName="author-item-avatar-frame"
                        skeletonClassName="author-item-avatar-skeleton"
                        skeletonLabel="Loading creator image"
                      >
                        <i className="fa fa-check"></i>
                      </AuthorCardImage>
                    </Link>
                  </div>
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
                        nft.nftId != null
                          ? `/item-details/${nft.nftId}`
                          : "/item-details"
                      }
                      state={{ item: detailsItem }}
                    >
                      <AuthorCardImage
                        src={nft.nftImage}
                        alt={nft.title || ""}
                        className="lazy nft__item_preview"
                        frameClassName="author-item-preview-frame"
                        skeletonClassName="author-item-preview-skeleton"
                        skeletonLabel="Loading NFT artwork"
                      />
                    </Link>
                  </div>
                  <div className="nft__item_info">
                    <Link
                      to={
                        nft.nftId != null
                          ? `/item-details/${nft.nftId}`
                          : "/item-details"
                      }
                      state={{ item: detailsItem }}
                    >
                      <h4>{nft.title}</h4>
                    </Link>
                    {nft.price != null && (
                      <div className="nft__item_price">{nft.price} ETH</div>
                    )}
                    <div className="nft__item_like">
                      <i className="fa fa-heart"></i>
                      <span>{nft.likes ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuthorItems;
