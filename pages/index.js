import Head from "next/head";
import { connectWallet, getAccounts } from "../ethereum/web3";
import styles from "../styles/Home.module.scss";
import Banner from "../components/banner";
import { useState, useEffect, useContext } from "react";
import { MailContext, ACTION_TYPES } from "../context/mail-context";

export default function Home() {
  //const [ownerAddress, setOwnerAddress] = useState("");
  const [hasInbox, setHasInbox] = useState(false);
  const { dispatch, state } = useContext(MailContext);
  const { walletAddress } = state;

  // Set account here if MetaMask is already connected
  useState(() => {
    const getWeb3Accounts = async () => {
      const accounts = await getAccounts();
      if (accounts != null && accounts.length > 0) {
        const walletAddress = accounts[0];
        dispatch({
          type: ACTION_TYPES.SET_WALLET_ADDRESS,
          payload: { walletAddress },
        });
      }
    };

    getWeb3Accounts();
  });

  return (
    <>
      <Head>
        <title>CryptoMail</title>
        <meta
          name="description"
          content="A mail application that uses the power of Blockchain to verify message transactions."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <Banner></Banner>
        <div className={styles.content}>
          <div className={styles.messageList}></div>
          <div className={styles.messageContent}>
            <div className={styles.createButtonWrapper}>
              {hasInbox && (
                <button className={styles.createButton}>Create Inbox</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
