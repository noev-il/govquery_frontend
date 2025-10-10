import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GovQuery Data Explorer",
  description: "Query government census and demographic data using natural language",
};

export default function GovQueryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
