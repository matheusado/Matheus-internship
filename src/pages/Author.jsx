import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import { NFTSkeleton } from "../components/home/NewItems";
import AOS from "aos";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors";
const FOLLOW_STORAGE_KEY = "followedAuthors";

const readFollowedAuthors = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(FOLLOW_STORAGE_KEY));

    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      return {};
    }

    return stored;
  } catch (err) {
    return {};
  }
};

const imageRequestSettled = (node, src) => {
  if (!node || !src || node.getAttribute("src") !== src || !node.complete) {
    return false;
  }

  return node.naturalWidth > 0 || node.naturalWidth === 0;
};

const Author = () => {
  const { authorId } = useParams();

  const [view, setView] = useState(() => ({
    authorId,
    author: null,
    loading: Boolean(authorId),
    error: authorId ? null : "No author selected.",
  }));
  const [retryCount, setRetryCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [followedById, setFollowedById] = useState(readFollowedAuthors);
  const [loadedAvatarSrc, setLoadedAvatarSrc] = useState(null);
  const avatarRef = useRef(null);

  if (view.authorId !== authorId) {
    setView({
      authorId,
      author: null,
      loading: Boolean(authorId),
      error: authorId ? null : "No author selected.",
    });
    setCopied(false);
    setLoadedAvatarSrc(null);
  }

  const author =
    view.author && String(view.author.authorId) === String(authorId)
      ? view.author
      : null;
  const loading = view.authorId === authorId && view.loading;
  const error = view.authorId === authorId ? view.error : null;
  const avatarReady =
    author != null && loadedAvatarSrc === author.authorImage;
  const isFollowed = Boolean(authorId && followedById[String(authorId)]);
  const baseFollowers = Number(author?.followers);
  const displayedFollowers = Number.isFinite(baseFollowers)
    ? Math.max(0, baseFollowers + (isFollowed ? 1 : 0))
    : null;

  useEffect(() => {
    try {
      localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(followedById));
    } catch (err) {
      console.error("Unable to save follow state:", err);
    }
  }, [followedById]);

  useEffect(() => {
    if (loading || !author) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      AOS.refreshHard();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, author]);

  useEffect(() => {
    if (!authorId) {
      return undefined;
    }

    const controller = new AbortController();

    const fetchAuthor = async () => {
      setView({
        authorId,
        author: null,
        loading: true,
        error: null,
      });

      try {
        const response = await axios.get(API_URL, {
          params: { author: authorId },
          signal: controller.signal,
        });

        const data = response.data;

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          String(data.authorId) !== String(authorId)
        ) {
          throw new Error("Author not found");
        }

        if (!controller.signal.aborted) {
          setView({
            authorId,
            author: {
              ...data,
              nftCollection: Array.isArray(data.nftCollection)
                ? data.nftCollection
                : [],
            },
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!axios.isCancel(err) && !controller.signal.aborted) {
          console.error("Error loading author:", err);
          setView({
            authorId,
            author: null,
            loading: false,
            error: "Unable to load this author.",
          });
        }
      }
    };

    fetchAuthor();

    return () => controller.abort();
  }, [authorId, retryCount]);

  useLayoutEffect(() => {
    const node = avatarRef.current;
    const avatarSrc = author?.authorImage;

    if (imageRequestSettled(node, avatarSrc)) {
      setLoadedAvatarSrc(avatarSrc);
    }
  }, [author, loading]);

  const copyAddress = async () => {
    if (!author?.address) {
      return;
    }

    try {
      await navigator.clipboard.writeText(author.address);
    } catch (err) {
      const area = document.createElement("textarea");
      area.value = author.address;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }

    setCopied(true);
  };

  const toggleFollow = () => {
    if (authorId == null) {
      return;
    }

    const id = String(authorId);

    setFollowedById((current) => {
      const next = { ...current };

      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }

      return next;
    });
  };

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
                          <div className="skeleton author-profile-wallet-placeholder"></div>
                        </div>
                      </div>
                    </div>

                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                        <div className="skeleton author-profile-price-placeholder"></div>
                        <div className="skeleton author-profile-follow-placeholder"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <div className="tab-1">
                        <div className="row explore-skeleton-grid author-items-skeleton">
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

            {!loading && error && (
              <div className="row">
                <div className="col-md-12 text-center">
                  <p role="alert">{error}</p>
                  {authorId && (
                    <button
                      type="button"
                      className="btn-main"
                      onClick={() => setRetryCount((count) => count + 1)}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {!loading && !error && author && (
              <div className="row">
                <div className="col-md-12">
                  <div
                    className="d_profile de-flex"
                    data-aos="fade-up"
                    data-aos-duration="700"
                  >
                    <div className="de-flex-col">
                      <div className="profile_avatar">
                        <span className="author-profile-avatar-frame">
                          {!avatarReady && (
                            <span
                              className="skeleton author-profile-avatar-placeholder"
                              role="status"
                              aria-label="Loading author image"
                            />
                          )}

                          <img
                            ref={avatarRef}
                            src={author.authorImage}
                            alt={author.authorName || ""}
                            style={{ opacity: avatarReady ? 1 : 0 }}
                            onLoad={(event) => {
                              if (
                                imageRequestSettled(
                                  event.currentTarget,
                                  author.authorImage
                                )
                              ) {
                                setLoadedAvatarSrc(author.authorImage);
                              }
                            }}
                            onError={(event) => {
                              if (
                                event.currentTarget.getAttribute("src") ===
                                author.authorImage
                              ) {
                                setLoadedAvatarSrc(author.authorImage);
                              }
                            }}
                          />
                        </span>

                        {avatarReady && <i className="fa fa-check"></i>}

                        <div className="profile_name">
                          <h4>
                            {author.authorName}
                            {author.tag && (
                              <span className="profile_username">
                                @{author.tag}
                              </span>
                            )}
                            {author.address && (
                              <span id="wallet" className="profile_wallet">
                                {author.address}
                              </span>
                            )}
                            {author.address && (
                              <button
                                id="btn_copy"
                                type="button"
                                title="Copy Text"
                                className={copied ? "clicked" : undefined}
                                onClick={copyAddress}
                              >
                                Copy
                              </button>
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                        {displayedFollowers != null && (
                          <div className="profile_follower">
                            {displayedFollowers} followers
                          </div>
                        )}
                        <button
                          type="button"
                          className={`btn-main author-follow-button${
                            isFollowed ? " is-following" : ""
                          }`}
                          aria-pressed={isFollowed}
                          onClick={toggleFollow}
                        >
                          {isFollowed ? "Unfollow" : "Follow"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="de_tab tab_simple">
                    <AuthorItems author={author} />
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
