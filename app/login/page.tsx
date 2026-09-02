import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = {
  title: "Σύνδεση | Oenia",
};

export default function LoginPage() {
  return <AuthCard />;
}
