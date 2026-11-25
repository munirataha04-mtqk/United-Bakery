import { Bodoni_Moda, Manrope } from "next/font/google";
import BakeryLanding from "../components/BakeryLanding";
import "./bakery.css";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display" });
const text = Manrope({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-text" });

export const metadata = {
  title: "United Bakery",
  description: "Fresh from the oven, every morning.",
};

export default function Home() {
  return (
    <div className={`${display.variable} ${text.variable}`}>
      <BakeryLanding />
    </div>
  );
}