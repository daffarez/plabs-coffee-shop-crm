import "./globals.css";

export const metadata = {
  title: "PLABS Assignment",
  description: "PLABS Coffee Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
