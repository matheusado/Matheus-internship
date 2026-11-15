import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";

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

const AuthorItems = () => {
  return (
    <div className="de_tab_content">
      <div className="tab-1">
        <div className="row">
          {new Array(8).fill(0).map((_, index) => (
            <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={index}>
              <div className="nft__item">
                <div className="author_list_pp">
                  <Link to="">
                    <AuthorCardImage
                      src={AuthorImage}
                      alt=""
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
                      <button>Buy Now</button>
                      <div className="nft__item_share">
                        <h4>Share</h4>
                        <a href="" target="_blank" rel="noreferrer">
                          <i className="fa fa-facebook fa-lg"></i>
                        </a>
                        <a href="" target="_blank" rel="noreferrer">
                          <i className="fa fa-twitter fa-lg"></i>
                        </a>
                        <a href="">
                          <i className="fa fa-envelope fa-lg"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <Link to="/item-details">
                    <AuthorCardImage
                      src={nftImage}
                      alt=""
                      className="lazy nft__item_preview"
                      frameClassName="author-item-preview-frame"
                      skeletonClassName="author-item-preview-skeleton"
                      skeletonLabel="Loading NFT artwork"
                    />
                  </Link>
                </div>
                <div className="nft__item_info">
                  <Link to="/item-details">
                    <h4>Pinky Ocean</h4>
                  </Link>
                  <div className="nft__item_price">2.52 ETH</div>
                  <div className="nft__item_like">
                    <i className="fa fa-heart"></i>
                    <span>97</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorItems;
