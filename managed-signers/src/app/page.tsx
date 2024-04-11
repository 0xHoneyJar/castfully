"use client";

import { DEFAULT_CAST, LOCAL_STORAGE_KEYS } from "@/constants";
import { User } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import axios from "axios";
import QRCode from "qrcode.react";
import { useState } from "react";
import styles from "./page.module.css";

interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>({
    signer_uuid: "",
    public_key: "",
    status: "approved",
  });
  const [text, setText] = useState<string>("");
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [isDeletingCast, setIsDeletingCast] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [deleteCastHash, setDeleteCastHash] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
  //   if (storedData) {
  //     const user: FarcasterUser = JSON.parse(storedData);
  //     setFarcasterUser(user);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (farcasterUser && farcasterUser.status === "pending_approval") {
  //     let intervalId: NodeJS.Timeout;

  //     const startPolling = () => {
  //       intervalId = setInterval(async () => {
  //         try {
  //           const response = await axios.get(
  //             `/api/signer?signer_uuid=${farcasterUser?.signer_uuid}`
  //           );
  //           const user = response.data as FarcasterUser;

  //           if (user?.status === "approved") {
  //             // store the user in local storage
  //             localStorage.setItem(
  //               LOCAL_STORAGE_KEYS.FARCASTER_USER,
  //               JSON.stringify(user)
  //             );

  //             setFarcasterUser(user);
  //             clearInterval(intervalId);
  //           }
  //         } catch (error) {
  //           console.error("Error during polling", error);
  //         }
  //       }, 2000);
  //     };

  //     const stopPolling = () => {
  //       clearInterval(intervalId);
  //     };

  //     const handleVisibilityChange = () => {
  //       if (document.hidden) {
  //         stopPolling();
  //       } else {
  //         startPolling();
  //       }
  //     };

  //     document.addEventListener("visibilitychange", handleVisibilityChange);

  //     // Start the polling when the effect runs.
  //     startPolling();

  //     // Cleanup function to remove the event listener and clear interval.
  //     return () => {
  //       document.removeEventListener(
  //         "visibilitychange",
  //         handleVisibilityChange
  //       );
  //       clearInterval(intervalId);
  //     };
  //   }
  // }, [farcasterUser]);

  const handleDeleteCast = async () => {
    setIsDeletingCast(true);
    try {
      const response = await axios.post("/api/delete-cast", {
        hash: deleteCastHash,
      });
    } catch (error) {
      console.error("Could not delete the cast", error);
    } finally {
      setIsDeletingCast(false);
    }
  };

  const handleCast = async () => {
    setIsCasting(true);
    const castText = text.length === 0 ? DEFAULT_CAST : text;
    try {
      const response = await axios.post("/api/cast", {
        embed: embedUrl,
        text: castText,
        signer_uuid: farcasterUser?.signer_uuid,
      });
      if (response.status === 200) {
        setText(""); // Clear the text field
        displayToast(); // Show the toast
      }
    } catch (error) {
      console.error("Could not send the cast", error);
    } finally {
      setIsCasting(false); // Re-enable the button
    }
  };

  const displayToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/user?fid=${farcasterUser?.fid}`);
      setUser(response.data);
    } catch (error) {
      console.error("Could not fetch the user", error);
    }
  };

  // useEffect(() => {
  //   if (farcasterUser?.status === "approved") {
  //     fetchUser();
  //   }
  // }, [farcasterUser]);

  return (
    <div className={styles.container}>
      {!farcasterUser?.status && (
        <button
          className={styles.btn}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "Loading..." : "Sign in with farcaster"}
        </button>
      )}

      {farcasterUser?.status == "pending_approval" &&
        farcasterUser?.signer_approval_url && (
          <div className={styles.qrContainer}>
            <QRCode value={farcasterUser.signer_approval_url} />
            <div className={styles.or}>OR</div>
            <a
              href={farcasterUser.signer_approval_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Click here to view the signer URL (on mobile)
            </a>
          </div>
        )}

      {farcasterUser?.status == "approved" && (
        <div className={styles.castSection}>
          <div className={styles.userInfo}>
            {/* {user?.pfp_url && (
              <Image
                src={user?.pfp_url}
                alt={user?.display_name || ""}
                width={100}
                height={100}
                className={styles.profilePic}
              />
            )} */}
            {/* Hello {user?.display_name} 👋 */}
            Cast to THJ Farcaster
          </div>
          <div className={styles.castContainer}>
            <textarea
              className={styles.castTextarea}
              placeholder={DEFAULT_CAST}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
            <p
              style={{
                textAlign: "left",
                fontSize: "12px",
              }}
            >
              Upload image to{" "}
              <a
                href="https://imgur.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                imgur
              </a>{" "}
              and paste the image URL here. To obtain the URL, right-click on
              the uploaded image, choose "Copy Image Address". The URL should
              resemble https://i.imgur.com/X09oIMv.png.
            </p>
            <input
              type="text"
              placeholder="https://imgur.com/X09oIMv"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
            />
            <button
              className={styles.btn}
              onClick={handleCast}
              disabled={isCasting}
            >
              {isCasting ? <span>🔄</span> : "Cast"}
            </button>
            {showToast && <div className={styles.toast}>Cast published</div>}
            <input
              type="text"
              placeholder="Cast identifier (ex. 0xe1b2475a)"
              value={deleteCastHash}
              onChange={(e) => setDeleteCastHash(e.target.value)}
            />
            <button
              className={styles.btn}
              onClick={handleDeleteCast}
              disabled={isDeletingCast}
            >
              {isDeletingCast ? <span>🔄</span> : "Delete Cast"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  async function handleSignIn() {
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  }

  async function createAndStoreSigner() {
    try {
      const response = await axios.post("/api/signer");
      if (response.status === 200) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(response.data)
        );
        setFarcasterUser(response.data);
      }
    } catch (error) {
      console.error("API Call failed", error);
    }
  }
}
