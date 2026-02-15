import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="min-h-dvh bg-zinc-50 text-zinc-950 antialiased">
        {children}
      </body>
    </html>
  );
}
