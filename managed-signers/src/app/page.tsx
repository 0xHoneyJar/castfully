"use client";

import { Dashboard } from "@/components/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { ADMINS } from "@/constants/admin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import QRCode from "qrcode.react";
import { useState } from "react";
import { useAccount } from "wagmi";
import styles from "./page.module.css";

interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export default function Home() {
  const { toast } = useToast();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>({
    signer_uuid: "",
    public_key: "",
    status: "approved",
  });

  if (!address) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <ConnectButton />
      </div>
    );
  }

  if (!ADMINS.includes(address)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div>You are not authorized to access this page</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      {farcasterUser?.status == "approved" && <Dashboard />}
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
