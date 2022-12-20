import styles from "./banner.module.scss";
import { MailContext } from "../context/mail-context";
import { connectWallet } from "../ethereum/web3";
import { useContext } from "react";

const Banner = () => {
  const { dispatch, state } = useContext(MailContext);
  const { walletAddress } = state;

  const connectWalletClick = async () => {
    connectWallet();
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleWrapper}>
        <h1>CryptoMail</h1>
      </div>
      <div className={styles.subTitleWrapper}>
        <h3>By AnonZero</h3>
      </div>
      <div className={styles.welcomeWrapper}>
        {walletAddress.length > 0 ? (
          <p>{`Welcome ${walletAddress}`}</p>
        ) : (
          <button onClick={connectWalletClick}>Connect MetaMask Wallet</button>
        )}
      </div>
    </div>
  );
};

export default Banner;
