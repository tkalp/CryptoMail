import Web3 from "web3";

export const connectWallet = () => {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    window.ethereum.request({ method: "eth_requestAccounts" });
    // web3 = new Web3(window.ethereum);
  }
};

export const getAccounts = async () => {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });

    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    return accounts;
  }

  return [];
};

export const getWeb3WithProvider = () => {
  const provider =
    "https://goerli.infura.io/v3/6c958218096f4a1ea752b393bc7aac85";
  const web3 = new Web3(provider);
  return web3;
};
