import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Σύνδεση | Oenia",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthCard />;
}
