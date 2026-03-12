import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-800 text-white h-screen">
        <h1 className="text-center text-4xl font-bold bg-gray-700 w-full py-4">
          The Pokédex Game
        </h1>

        {children}
      </body>
    </html>
  );
}
