import type { ReactNode } from "react";
import Footer from "~/components/footer";

export default function FrontendLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

