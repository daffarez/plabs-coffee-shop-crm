import "./globals.css";

export const metadata = {
  title: "PLABS Assignment",
  description: "PLABS Coffee Shop",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
