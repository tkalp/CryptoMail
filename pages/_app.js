import "../styles/globals.scss";
import { Roboto } from "@next/font/google";
import MailProvider from "../context/mail-context";
const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <main className={roboto.className}>
      <MailProvider>
        <Component {...pageProps} />
      </MailProvider>
    </main>
  );
}
